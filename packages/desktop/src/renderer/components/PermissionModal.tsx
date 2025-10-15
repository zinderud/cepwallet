/**
 * PermissionModal - Permission Request Dialog
 * Displays and manages permission requests from dApps
 */

import React, { useState } from 'react';
import './Browser.css';

interface PermissionModalProps {
  requestId: string;
  method: string;
  dapp: string;
  permissions: string[];
  onApprove: () => void;
  onReject: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  requestId,
  method,
  dapp,
  permissions,
  onApprove,
  onReject,
}) => {
  const [alwaysAllow, setAlwaysAllow] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState(
    new Set(permissions)
  );

  /**
   * Format method name for display
   */
  const formatMethodName = (method: string): string => {
    const names: Record<string, string> = {
      eth_requestAccounts: 'Connect Wallet',
      eth_sendTransaction: 'Send Transaction',
      eth_signTransaction: 'Sign Transaction',
      personal_sign: 'Sign Message',
      eth_signTypedData: 'Sign Typed Data',
      wallet_switchEthereumChain: 'Switch Chain',
      wallet_addEthereumChain: 'Add Chain',
    };

    return names[method] || method;
  };

  /**
   * Get permission description
   */
  const getPermissionDescription = (permission: string): string => {
    const descriptions: Record<string, string> = {
      accounts: 'Access your wallet accounts',
      sign: 'Sign messages and transactions',
      send_transactions: 'Send transactions on your behalf',
      network: 'View and manage network information',
      gas: 'Estimate and calculate gas fees',
    };

    return descriptions[permission] || permission;
  };

  /**
   * Handle permission toggle
   */
  const togglePermission = (permission: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permission)) {
      newSelected.delete(permission);
    } else {
      newSelected.add(permission);
    }
    setSelectedPermissions(newSelected);
  };

  /**
   * Handle approve
   */
  const handleApprove = () => {
    if (selectedPermissions.size === 0) {
      alert('Please select at least one permission');
      return;
    }

    if (alwaysAllow) {
      // Store always-allow preference
      console.log(`Always allow ${dapp} for method ${method}`);
    }

    onApprove();
  };

  return (
    <div className="modal-overlay">
      <div className="permission-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Permission Request</h2>
          <button className="modal-close" onClick={onReject}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* dApp info */}
          <div className="dapp-info">
            <div className="dapp-icon">🌐</div>
            <div className="dapp-details">
              <p className="dapp-name">{dapp}</p>
              <p className="dapp-request">
                is requesting {formatMethodName(method)}
              </p>
            </div>
          </div>

          {/* Permission list */}
          <div className="permissions-section">
            <h3>Requested Permissions:</h3>
            <div className="permissions-list">
              {permissions.length > 0 ? (
                permissions.map((permission) => (
                  <label key={permission} className="permission-item">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    <div className="permission-text">
                      <strong>{permission}</strong>
                      <p>{getPermissionDescription(permission)}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="no-permissions">
                  No specific permissions requested
                </p>
              )}
            </div>
          </div>

          {/* Always allow checkbox */}
          <label className="always-allow">
            <input
              type="checkbox"
              checked={alwaysAllow}
              onChange={(e) => setAlwaysAllow(e.target.checked)}
            />
            <span>Always allow {dapp} for this action</span>
          </label>

          {/* Warning */}
          <div className="permission-warning">
            <strong>⚠️ Security Warning:</strong>
            <p>
              Only approve permissions from trusted dApps. This site will have
              access to perform the requested actions.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn-reject"
            onClick={onReject}
          >
            Reject
          </button>
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={selectedPermissions.size === 0}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
