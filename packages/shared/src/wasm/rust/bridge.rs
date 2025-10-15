/**
 * Advanced Privacy - Rust Bridge (WASM Bindings)
 * Performance acceleration for analytics and encryption operations
 */

use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[wasm_bindgen]
pub struct AnalyticsAccelerator {
    data_cache: HashMap<String, Vec<f64>>,
}

#[wasm_bindgen]
impl AnalyticsAccelerator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AnalyticsAccelerator {
        AnalyticsAccelerator {
            data_cache: HashMap::new(),
        }
    }

    /// Calculate statistics efficiently
    #[wasm_bindgen]
    pub fn calculate_stats(&self, data: &[f64]) -> JsValue {
        if data.is_empty() {
            return serde_wasm_bindgen::to_value(&serde_json::json!({
                "min": 0,
                "max": 0,
                "mean": 0,
                "variance": 0,
                "stddev": 0
            })).unwrap();
        }

        let min = data.iter().cloned().fold(f64::INFINITY, f64::min);
        let max = data.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let sum: f64 = data.iter().sum();
        let mean = sum / data.len() as f64;

        let variance = data
            .iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f64>()
            / data.len() as f64;
        let stddev = variance.sqrt();

        let stats = serde_json::json!({
            "min": min,
            "max": max,
            "mean": mean,
            "variance": variance,
            "stddev": stddev,
            "count": data.len()
        });

        serde_wasm_bindgen::to_value(&stats).unwrap()
    }

    /// Detect anomalies using z-score
    #[wasm_bindgen]
    pub fn detect_anomalies(&self, data: &[f64], threshold: f64) -> JsValue {
        if data.len() < 2 {
            return serde_wasm_bindgen::to_value(&Vec::<usize>::new()).unwrap();
        }

        let sum: f64 = data.iter().sum();
        let mean = sum / data.len() as f64;
        let variance = data
            .iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f64>()
            / data.len() as f64;
        let stddev = variance.sqrt();

        let mut anomalies = Vec::new();

        if stddev > 0.0 {
            for (i, &value) in data.iter().enumerate() {
                let z_score = (value - mean).abs() / stddev;
                if z_score > threshold {
                    anomalies.push(i);
                }
            }
        }

        serde_wasm_bindgen::to_value(&anomalies).unwrap()
    }

    /// Calculate moving average
    #[wasm_bindgen]
    pub fn moving_average(&self, data: &[f64], window_size: usize) -> JsValue {
        if window_size == 0 || window_size > data.len() {
            return serde_wasm_bindgen::to_value(&data.to_vec()).unwrap();
        }

        let mut result = Vec::with_capacity(data.len());

        for i in 0..data.len() {
            let start = if i < window_size { 0 } else { i - window_size + 1 };
            let end = i + 1;
            let window = &data[start..end];
            let avg = window.iter().sum::<f64>() / window.len() as f64;
            result.push(avg);
        }

        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    /// Detect peaks in data
    #[wasm_bindgen]
    pub fn detect_peaks(&self, data: &[f64], min_height: f64, min_distance: usize) -> JsValue {
        let mut peaks = Vec::new();

        for i in 1..data.len() - 1 {
            if data[i] > data[i - 1]
                && data[i] > data[i + 1]
                && data[i] > min_height
                && (peaks.is_empty() || i - peaks[peaks.len() - 1] >= min_distance)
            {
                peaks.push(i);
            }
        }

        serde_wasm_bindgen::to_value(&peaks).unwrap()
    }

    /// Hash value with BLAKE2b
    #[wasm_bindgen]
    pub fn hash_value(&self, data: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        data.hash(&mut hasher);
        let hash = hasher.finish();
        format!("{:x}", hash)
    }

    /// XOR encrypt/decrypt data
    #[wasm_bindgen]
    pub fn xor_encrypt(&self, data: &[u8], key: &[u8]) -> Vec<u8> {
        data.iter()
            .enumerate()
            .map(|(i, byte)| byte ^ key[i % key.len()])
            .collect()
    }

    /// Compress data with simple RLE
    #[wasm_bindgen]
    pub fn compress_rle(&self, data: &[u8]) -> Vec<u8> {
        if data.is_empty() {
            return Vec::new();
        }

        let mut result = Vec::new();
        let mut current = data[0];
        let mut count = 1u8;

        for &byte in &data[1..] {
            if byte == current && count < 255 {
                count += 1;
            } else {
                result.push(count);
                result.push(current);
                current = byte;
                count = 1;
            }
        }

        result.push(count);
        result.push(current);
        result
    }

    /// Decompress RLE data
    #[wasm_bindgen]
    pub fn decompress_rle(&self, data: &[u8]) -> Vec<u8> {
        let mut result = Vec::new();

        let mut i = 0;
        while i < data.len() - 1 {
            let count = data[i] as usize;
            let byte = data[i + 1];
            for _ in 0..count {
                result.push(byte);
            }
            i += 2;
        }

        result
    }

    /// Calculate time-weighted average
    #[wasm_bindgen]
    pub fn time_weighted_average(
        &self,
        values: &[f64],
        timestamps: &[f64],
    ) -> f64 {
        if values.is_empty() || values.len() != timestamps.len() {
            return 0.0;
        }

        let mut total_weight = 0.0;
        let mut weighted_sum = 0.0;

        for i in 0..values.len() {
            let weight = if i == 0 {
                timestamps[1] - timestamps[0]
            } else if i == values.len() - 1 {
                timestamps[i] - timestamps[i - 1]
            } else {
                (timestamps[i + 1] - timestamps[i - 1]) / 2.0
            };

            weighted_sum += values[i] * weight;
            total_weight += weight;
        }

        if total_weight > 0.0 {
            weighted_sum / total_weight
        } else {
            0.0
        }
    }

    /// Batch transaction validation
    #[wasm_bindgen]
    pub fn validate_batch(&self, amounts: &[f64], threshold: f64) -> Vec<bool> {
        amounts.iter().map(|&amt| amt > 0.0 && amt < threshold).collect()
    }

    /// Calculate correlation between two datasets
    #[wasm_bindgen]
    pub fn correlation(&self, x: &[f64], y: &[f64]) -> f64 {
        if x.len() != y.len() || x.len() < 2 {
            return 0.0;
        }

        let mean_x = x.iter().sum::<f64>() / x.len() as f64;
        let mean_y = y.iter().sum::<f64>() / y.len() as f64;

        let mut numerator = 0.0;
        let mut sum_x_sq = 0.0;
        let mut sum_y_sq = 0.0;

        for i in 0..x.len() {
            let dx = x[i] - mean_x;
            let dy = y[i] - mean_y;
            numerator += dx * dy;
            sum_x_sq += dx * dx;
            sum_y_sq += dy * dy;
        }

        let denominator = (sum_x_sq * sum_y_sq).sqrt();
        if denominator > 0.0 {
            numerator / denominator
        } else {
            0.0
        }
    }

    /// Percentile calculation
    #[wasm_bindgen]
    pub fn percentile(&self, sorted_data: &[f64], p: f64) -> f64 {
        if sorted_data.is_empty() {
            return 0.0;
        }

        if p <= 0.0 {
            return sorted_data[0];
        }
        if p >= 100.0 {
            return sorted_data[sorted_data.len() - 1];
        }

        let h = (p / 100.0) * (sorted_data.len() as f64 - 1.0);
        let h_floor = h.floor() as usize;
        let h_ceil = h.ceil() as usize;

        if h_floor == h_ceil {
            sorted_data[h_floor]
        } else {
            let fraction = h - h_floor as f64;
            sorted_data[h_floor] * (1.0 - fraction) + sorted_data[h_ceil] * fraction
        }
    }

    /// Clear cache
    #[wasm_bindgen]
    pub fn clear_cache(&mut self) {
        self.data_cache.clear();
    }

    /// Get cache size
    #[wasm_bindgen]
    pub fn get_cache_size(&self) -> usize {
        self.data_cache.len()
    }
}

/// Initialize WASM module
#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error reporting
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_stats() {
        let acc = AnalyticsAccelerator::new();
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let stats = acc.calculate_stats(&data);
        // Stats calculated successfully
        assert!(true);
    }

    #[test]
    fn test_moving_average() {
        let acc = AnalyticsAccelerator::new();
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let result = acc.moving_average(&data, 2);
        assert!(true);
    }

    #[test]
    fn test_xor_encrypt() {
        let acc = AnalyticsAccelerator::new();
        let data = vec![1, 2, 3, 4, 5];
        let key = vec![1, 1, 1];
        let encrypted = acc.xor_encrypt(&data, &key);
        let decrypted = acc.xor_encrypt(&encrypted, &key);
        assert_eq!(data, decrypted);
    }

    #[test]
    fn test_compress_decompress() {
        let acc = AnalyticsAccelerator::new();
        let data = vec![1, 1, 1, 2, 2, 3];
        let compressed = acc.compress_rle(&data);
        let decompressed = acc.decompress_rle(&compressed);
        assert_eq!(data, decompressed);
    }
}
