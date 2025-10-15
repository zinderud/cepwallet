use anyhow::Result;
use futures::{SinkExt, StreamExt};
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::{Arc, Mutex};
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::accept_async;
use uuid::Uuid;

mod device;
mod messages;
mod handlers;
mod session;

use session::Session;

const BRIDGE_ADDRESS: &str = "127.0.0.1:21325";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeMessage {
    pub id: String,
    pub message_type: String,
    pub payload: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeResponse {
    pub id: String,
    pub status: String,
    pub result: Option<Value>,
    pub error: Option<String>,
}

pub struct BridgeServer {
    sessions: Arc<Mutex<Vec<Session>>>,
}

impl BridgeServer {
    fn new() -> Self {
        BridgeServer {
            sessions: Arc::new(Mutex::new(Vec::new())),
        }
    }

    async fn handle_connection(&self, stream: TcpStream, addr: String) -> Result<()> {
        info!("New connection from: {}", addr);

        let ws_stream = accept_async(stream)
            .await
            .map_err(|e| anyhow::anyhow!("WebSocket handshake error: {}", e))?;

        info!("WebSocket connection established: {}", addr);

        let session_id = Uuid::new_v4().to_string();
        let mut session = Session::new(session_id.clone());

        let (mut sender, mut receiver) = ws_stream.split();

        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(msg) => {
                    if let Ok(text) = msg.to_text() {
                        match serde_json::from_str::<BridgeMessage>(text) {
                            Ok(bridge_msg) => {
                                info!(
                                    "Received message: {} (type: {})",
                                    bridge_msg.id, bridge_msg.message_type
                                );

                                let response = self
                                    .handle_message(&session, &bridge_msg)
                                    .await;

                                let response_text = serde_json::to_string(&response)?;
                                sender.send(tokio_tungstenite::tungstenite::Message::Text(
                                    response_text,
                                )).await?;
                            }
                            Err(e) => {
                                warn!("Failed to parse message: {}", e);
                                let error_response = BridgeResponse {
                                    id: Uuid::new_v4().to_string(),
                                    status: "error".to_string(),
                                    result: None,
                                    error: Some(format!("Parse error: {}", e)),
                                };
                                let response_text = serde_json::to_string(&error_response)?;
                                sender.send(tokio_tungstenite::tungstenite::Message::Text(
                                    response_text,
                                )).await?;
                            }
                        }
                    }
                }
                Err(e) => {
                    error!("WebSocket error: {}", e);
                    break;
                }
            }
        }

        info!("Connection closed: {}", addr);
        Ok(())
    }

    async fn handle_message(
        &self,
        session: &Session,
        msg: &BridgeMessage,
    ) -> BridgeResponse {
        match msg.message_type.as_str() {
            "ping" => BridgeResponse {
                id: msg.id.clone(),
                status: "success".to_string(),
                result: Some(json!({ "pong": true })),
                error: None,
            },
            "get_device_info" => {
                match device::get_device_info().await {
                    Ok(info) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "success".to_string(),
                        result: Some(serde_json::to_value(info).unwrap_or(Value::Null)),
                        error: None,
                    },
                    Err(e) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "error".to_string(),
                        result: None,
                        error: Some(format!("Device error: {}", e)),
                    },
                }
            }
            "get_public_key" => {
                match handlers::get_public_key(&msg.payload).await {
                    Ok(result) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "success".to_string(),
                        result: Some(result),
                        error: None,
                    },
                    Err(e) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "error".to_string(),
                        result: None,
                        error: Some(e.to_string()),
                    },
                }
            }
            "sign_transaction" => {
                match handlers::sign_transaction(&msg.payload).await {
                    Ok(result) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "success".to_string(),
                        result: Some(result),
                        error: None,
                    },
                    Err(e) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "error".to_string(),
                        result: None,
                        error: Some(e.to_string()),
                    },
                }
            }
            "sign_message" => {
                match handlers::sign_message(&msg.payload).await {
                    Ok(result) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "success".to_string(),
                        result: Some(result),
                        error: None,
                    },
                    Err(e) => BridgeResponse {
                        id: msg.id.clone(),
                        status: "error".to_string(),
                        result: None,
                        error: Some(e.to_string()),
                    },
                }
            }
            _ => BridgeResponse {
                id: msg.id.clone(),
                status: "error".to_string(),
                result: None,
                error: Some(format!("Unknown message type: {}", msg.message_type)),
            },
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let listener = TcpListener::bind(BRIDGE_ADDRESS).await?;
    info!("🌉 CepWallet Bridge listening on {}", BRIDGE_ADDRESS);

    let bridge = Arc::new(BridgeServer::new());

    loop {
        let (stream, addr) = listener.accept().await?;
        let bridge = Arc::clone(&bridge);
        let addr_str = addr.to_string();

        tokio::spawn(async move {
            if let Err(e) = bridge.handle_connection(stream, addr_str).await {
                error!("Connection error: {}", e);
            }
        });
    }
}
