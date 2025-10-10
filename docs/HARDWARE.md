# CepWallet - Özel Hardware Geliştirme Rehberi

## 🔧 Hardware Wallet Tasarımı

Bu dokümantasyon, Trezor firmware'ini kullanarak kendi özel hardware wallet'ınızı geliştirmek isteyenler içindir.

---

## 📐 Hardware Tasarım Spesifikasyonları

### Minimum Gereksinimler

```
Processor (MCU):
├── STM32F429 (Trezor Model T benzeri) veya
├── STM32F405 (Trezor One benzeri)
└── ARM Cortex-M4, 180MHz+, 1MB+ Flash, 192KB+ RAM

Secure Element (Önerilir):
├── ATECC608A (Microchip) veya
├── SE050 (NXP) veya
└── Optiga Trust M (Infineon)

Display:
├── OLED 128x64 monochrome (basit) veya
├── IPS LCD 240x240 color (gelişmiş)
└── SPI/I2C interface

Input:
├── 2 buton (minimum - yukarı/aşağı) veya
├── 4 buton (yukarı/aşağı/sol/sağ)
└── Opsiyonel: Touchscreen (Model T gibi)

Connectivity:
├── USB-C (tercih edilir) veya USB Micro-B
├── USB HID veya WebUSB protocol
└── Opsiyonel: Bluetooth LE 5.0+

Storage:
├── Internal Flash: 512KB-1MB
└── Opsiyonel: External Flash (firmware backup)

Power:
├── USB powered (5V)
└── Opsiyonel: Battery (mobile use)
```

---

## 🛠️ Önerilen Bill of Materials (BOM)

### Option 1: STM32F4 Based (Trezor One Clone)

| Component | Part Number | Quantity | Unit Price | Notes |
|-----------|------------|----------|------------|-------|
| MCU | STM32F405RGT6 | 1 | $10 | 168MHz, 1MB Flash |
| Secure Element | ATECC608A-SSHDA-B | 1 | $0.60 | Crypto authentication |
| Display | SSD1306 OLED | 1 | $3 | 128x64 I2C |
| USB Connector | USB-C 16 pin | 1 | $0.50 | Reversible |
| Buttons | Tactile Switch 6x6mm | 2 | $0.10 | Navigation |
| Crystal | 8MHz Crystal | 1 | $0.30 | External oscillator |
| Voltage Regulator | AMS1117-3.3 | 1 | $0.20 | 3.3V output |
| PCB | Custom 2-layer | 1 | $5 | 50x30mm |
| Case | 3D Printed ABS | 1 | $2 | Custom design |

**Total (prototype): ~$25-30 per unit**
**Production (1000+ units): ~$15-18 per unit**

### Option 2: STM32F4 + Color Display (Trezor Model T Clone)

| Component | Part Number | Quantity | Unit Price | Notes |
|-----------|------------|----------|------------|-------|
| MCU | STM32F427VIT6 | 1 | $15 | 180MHz, 2MB Flash |
| Secure Element | SE050C2HQ1/Z01SDZ | 1 | $1.50 | NXP secure element |
| Display | ILI9341 TFT LCD | 1 | $5 | 240x320 touchscreen |
| USB Connector | USB-C 24 pin | 1 | $0.80 | Full featured |
| Crystal | 8MHz + 32.768kHz | 2 | $0.50 | Main + RTC |
| Voltage Regulator | TPS62160 | 1 | $1.20 | Buck converter |
| SD Card Slot | Micro SD | 1 | $0.80 | Firmware update |
| PCB | Custom 4-layer | 1 | $15 | 60x40mm |
| Case | Injection molded | 1 | $3 | Production |

**Total (prototype): ~$50-60 per unit**
**Production (1000+ units): ~$25-30 per unit**

---

## 📋 Schematic Design

### Core Circuit - STM32F4 + ATECC608A

```
                     ┌──────────────────┐
                     │   STM32F405RGT6  │
                     │                  │
USB-C ──────────────│ PA11/USB_DM      │
                     │ PA12/USB_DP      │
                     │                  │
                     │ PB6/I2C1_SCL ────┼────┐
                     │ PB7/I2C1_SDA ────┼──┐ │
                     │                  │  │ │
                     │ PB8/I2C1_SCL ────┼──│─┼───> OLED Display
                     │ PB9/I2C1_SDA ────┼──│─┘    (I2C)
                     │                  │  │
BTN1 (Up) ──────────│ PA0              │  │
BTN2 (Down) ────────│ PA1              │  │
                     │                  │  │
                     │ NRST ────────────┼──┼───> Reset Circuit
                     │ BOOT0 ───────────┼──┼───> GND (normal boot)
                     │                  │  │
                     │ VDD ─────────────┼──┼───> 3.3V
                     │ VSS ─────────────┼──┼───> GND
                     └──────────────────┘  │
                                           │
                     ┌──────────────────┐  │
                     │  ATECC608A       │  │
                     │                  │  │
                     │ SDA ─────────────┼──┘
                     │ SCL ─────────────┼────┘
                     │                  │
                     │ VCC ─────────────┼────> 3.3V
                     │ GND ─────────────┼────> GND
                     └──────────────────┘

Power Supply:
USB 5V ──> [TPS62160] ──> 3.3V ──> MCU, Display, SE
            Buck Conv.
```

### Display Connection (SPI Alternative)

```
STM32F405
    PA5/SPI1_SCK  ────> Display SCK
    PA7/SPI1_MOSI ────> Display MOSI
    PA4/SPI1_NSS  ────> Display CS
    PB0/GPIO      ────> Display DC
    PB1/GPIO      ────> Display RST
```

### Secure Element I2C Connection

```
ATECC608A:
    Pin 1 (NC)    - Not connected
    Pin 2 (NC)    - Not connected  
    Pin 3 (NC)    - Not connected
    Pin 4 (GND)   - Ground
    Pin 5 (SDA)   - I2C Data (to STM32 PB7)
    Pin 6 (SCL)   - I2C Clock (to STM32 PB6)
    Pin 7 (NC)    - Not connected
    Pin 8 (VCC)   - 3.3V power
```

---

## 💾 Firmware Development

### Trezor Firmware Fork

```bash
# Trezor firmware'ini clone et
git clone https://github.com/trezor/trezor-firmware.git
cd trezor-firmware

# Legacy (Trezor One) için
cd legacy

# Core (Trezor Model T) için
cd core
```

### Custom Board Configuration

**legacy/firmware/cepwallet_board.h:**

```c
// CepWallet Hardware Configuration

#ifndef __CEPWALLET_BOARD_H__
#define __CEPWALLET_BOARD_H__

// MCU Configuration
#define STM32F4
#define STM32F405xx
#define HSE_VALUE 8000000U

// Display Configuration
#define USE_SSD1306        // OLED display
#define DISPLAY_I2C        I2C1
#define DISPLAY_WIDTH      128
#define DISPLAY_HEIGHT     64

// Secure Element
#define USE_ATECC608A
#define SE_I2C             I2C1
#define SE_I2C_ADDRESS     0xC0

// Buttons
#define BTN_UP_PIN         GPIO_PIN_0
#define BTN_UP_PORT        GPIOA
#define BTN_DOWN_PIN       GPIO_PIN_1
#define BTN_DOWN_PORT      GPIOA

// USB
#define USB_VID            0x1209  // Pid.codes VID
#define USB_PID            0x5301  // Your PID
#define USB_MANUFACTURER   "CepWallet"
#define USB_PRODUCT        "CepWallet One"

// Memory
#define FLASH_APP_START    0x08010000
#define FLASH_SIZE         (1024 * 1024)  // 1MB

#endif
```

### Main Application Loop

**legacy/firmware/main.c:**

```c
#include "cepwallet_board.h"
#include "usb.h"
#include "oled.h"
#include "buttons.h"
#include "crypto.h"
#include "storage.h"
#include "messages.h"

int main(void) {
    // System init
    SystemClock_Config();
    
    // Peripheral init
    GPIO_Init();
    I2C_Init();
    USB_Init();
    
    // Hardware wallet components
    oled_init();
    buttons_init();
    storage_init();
    crypto_init();
    
    // Secure element
    atecc608a_init();
    
    // Check if device is initialized
    if (!storage_is_initialized()) {
        show_welcome_screen();
    }
    
    // Show home screen
    oled_clear();
    oled_draw_logo();
    oled_print("CepWallet Ready");
    oled_refresh();
    
    // Main loop
    while (1) {
        // Check USB messages
        if (usb_message_available()) {
            handle_usb_message();
        }
        
        // Check buttons
        if (button_pressed(BTN_UP)) {
            navigate_menu(MENU_UP);
        }
        if (button_pressed(BTN_DOWN)) {
            navigate_menu(MENU_DOWN);
        }
        
        // Update display
        oled_refresh();
        
        // Low power mode
        __WFI();  // Wait for interrupt
    }
}
```

### Transaction Signing Implementation

**legacy/firmware/signing.c:**

```c
#include "signing.h"
#include "crypto.h"
#include "atecc608a.h"
#include "ethereum.h"

// Ethereum transaction structure
typedef struct {
    uint8_t to[20];
    uint8_t value[32];
    uint8_t gas_limit[32];
    uint8_t gas_price[32];
    uint8_t nonce[32];
    uint8_t data[1024];
    uint32_t data_len;
    uint32_t chain_id;
} EthereumTx;

bool ethereum_sign_transaction(const EthereumTx *tx, uint8_t *signature) {
    uint8_t hash[32];
    uint8_t private_key[32];
    
    // 1. Show transaction on screen
    oled_clear();
    oled_print_center(0, "Confirm Transaction", FONT_STANDARD);
    
    char to_str[43];
    ethereum_address_to_string(tx->to, to_str);
    oled_print(2, "To:", FONT_STANDARD);
    oled_print(3, to_str, FONT_STANDARD);
    
    char value_str[32];
    ethereum_format_wei(tx->value, value_str);
    oled_print(5, "Amount:", FONT_STANDARD);
    oled_print(6, value_str, FONT_STANDARD);
    
    oled_print(7, "Hold to confirm", FONT_STANDARD);
    oled_refresh();
    
    // 2. Wait for user confirmation (hold button for 3 sec)
    if (!button_held(BTN_UP, 3000)) {
        return false;  // User rejected
    }
    
    // 3. Calculate transaction hash (EIP-155)
    ethereum_calculate_tx_hash(tx, hash);
    
    // 4. Get private key from secure element
    uint32_t path[] = {0x8000002C, 0x8000003C, 0x80000000, 0, 0};
    if (!atecc608a_derive_key(path, 5, private_key)) {
        return false;
    }
    
    // 5. Sign with ECDSA (secp256k1)
    if (!ecdsa_sign(private_key, hash, signature)) {
        memzero(private_key, 32);
        return false;
    }
    
    // 6. Clear sensitive data
    memzero(private_key, 32);
    
    // 7. Show success
    oled_clear();
    oled_print_center(3, "Transaction Signed", FONT_STANDARD);
    oled_refresh();
    delay(2000);
    
    return true;
}

// Calculate Ethereum tx hash (EIP-155)
void ethereum_calculate_tx_hash(const EthereumTx *tx, uint8_t *hash) {
    SHA3_CTX ctx;
    
    keccak_Init(&ctx);
    
    // RLP encode and hash
    uint8_t rlp_buffer[2048];
    size_t rlp_len = ethereum_tx_encode_rlp(tx, rlp_buffer);
    
    keccak_Update(&ctx, rlp_buffer, rlp_len);
    keccak_Final(&ctx, hash);
}
```

### Secure Element Integration

**legacy/firmware/atecc608a.c:**

```c
#include "atecc608a.h"
#include "i2c.h"
#include "bip32.h"

#define ATECC608A_ADDR 0xC0

bool atecc608a_init(void) {
    uint8_t config[128];
    
    // Wake up device
    atecc608a_wake();
    
    // Read config zone
    if (!atecc608a_read_config(config)) {
        return false;
    }
    
    // Check if locked
    if (!atecc608a_is_locked()) {
        // Configure and lock (first time setup)
        atecc608a_configure();
        atecc608a_lock();
    }
    
    return true;
}

bool atecc608a_derive_key(const uint32_t *path, size_t path_len, uint8_t *key) {
    // BIP32 derivation using secure element
    
    // 1. Get root key from slot 0 (never leaves chip)
    // 2. Derive child keys using ECDH
    // 3. Return derived key
    
    HDNode node;
    
    // Load root node (encrypted, stored in EEPROM)
    if (!storage_get_root_node(&node)) {
        return false;
    }
    
    // Derive path
    for (size_t i = 0; i < path_len; i++) {
        hdnode_private_ckd(&node, path[i]);
    }
    
    // Copy private key
    memcpy(key, node.private_key, 32);
    
    // Clear node
    memzero(&node, sizeof(HDNode));
    
    return true;
}

void atecc608a_wake(void) {
    // Send wake condition (SDA low for 60μs)
    I2C_GenerateSTART(I2C1, ENABLE);
    delay_us(60);
    I2C_GenerateSTOP(I2C1, ENABLE);
    delay_us(1500);
}
```

### Display Driver (OLED)

**legacy/firmware/oled.c:**

```c
#include "oled.h"
#include "i2c.h"

#define OLED_ADDR 0x3C
#define OLED_WIDTH 128
#define OLED_HEIGHT 64

static uint8_t oled_buffer[OLED_WIDTH * OLED_HEIGHT / 8];

void oled_init(void) {
    // Initialize sequence for SSD1306
    const uint8_t init_seq[] = {
        0xAE,        // Display off
        0xD5, 0x80,  // Set display clock
        0xA8, 0x3F,  // Set multiplex (64)
        0xD3, 0x00,  // Set display offset
        0x40,        // Set start line
        0x8D, 0x14,  // Charge pump
        0x20, 0x00,  // Memory mode
        0xA1,        // Segment remap
        0xC8,        // COM scan direction
        0xDA, 0x12,  // COM pins config
        0x81, 0xCF,  // Set contrast
        0xD9, 0xF1,  // Set precharge
        0xDB, 0x40,  // Set VCOMH
        0xA4,        // Display all on resume
        0xA6,        // Normal display
        0xAF         // Display on
    };
    
    for (size_t i = 0; i < sizeof(init_seq); i++) {
        oled_command(init_seq[i]);
    }
    
    oled_clear();
    oled_refresh();
}

void oled_command(uint8_t cmd) {
    uint8_t data[2] = {0x00, cmd};
    I2C_Write(I2C1, OLED_ADDR, data, 2);
}

void oled_refresh(void) {
    // Set column address
    oled_command(0x21);
    oled_command(0);
    oled_command(127);
    
    // Set page address
    oled_command(0x22);
    oled_command(0);
    oled_command(7);
    
    // Write data
    uint8_t data[OLED_WIDTH + 1];
    data[0] = 0x40;  // Data mode
    
    for (uint8_t page = 0; page < 8; page++) {
        memcpy(data + 1, &oled_buffer[page * OLED_WIDTH], OLED_WIDTH);
        I2C_Write(I2C1, OLED_ADDR, data, OLED_WIDTH + 1);
    }
}

void oled_print(uint8_t line, const char *text, uint8_t font) {
    // Simple text rendering
    uint8_t x = 0;
    uint8_t y = line * 8;
    
    while (*text) {
        oled_draw_char(x, y, *text, font);
        x += 8;
        text++;
    }
}
```

---

## 🔨 Build Process

### Setup Build Environment

```bash
# Install ARM toolchain
# macOS:
brew install --cask gcc-arm-embedded

# Linux:
sudo apt-get install gcc-arm-none-eabi

# Install dependencies
pip3 install poetry
poetry install

# Install protobuf compiler
# macOS:
brew install protobuf
# Linux:
sudo apt-get install protobuf-compiler
```

### Compile Firmware

```bash
cd trezor-firmware/legacy

# Configure for CepWallet
export BOARD=cepwallet

# Build bootloader
make -C bootloader

# Build firmware
make -C firmware

# Output files:
# - bootloader/bootloader.bin
# - firmware/firmware.bin
```

### Flash Firmware

**Using ST-Link (for development):**

```bash
# Install tools
# macOS:
brew install stlink

# Linux:
sudo apt-get install stlink-tools

# Flash bootloader
st-flash write bootloader/bootloader.bin 0x08000000

# Flash firmware
st-flash write firmware/firmware.bin 0x08010000
```

**Using DFU (for production):**

```bash
# Install dfu-util
# macOS:
brew install dfu-util

# Linux:
sudo apt-get install dfu-util

# Create combined image
cat bootloader.bin firmware.bin > combined.bin

# Flash via USB
dfu-util -a 0 -s 0x08000000 -D combined.bin
```

---

## 🧪 Testing

### Hardware Tests

```c
// Test secure element
void test_secure_element(void) {
    uint8_t random[32];
    
    if (atecc608a_random(random)) {
        oled_print(0, "SE: OK", FONT_STANDARD);
    } else {
        oled_print(0, "SE: FAIL", FONT_STANDARD);
    }
}

// Test display
void test_display(void) {
    for (uint8_t i = 0; i < 8; i++) {
        oled_clear();
        oled_print(i, "Test Line", FONT_STANDARD);
        oled_refresh();
        delay(500);
    }
}

// Test buttons
void test_buttons(void) {
    while (1) {
        if (button_pressed(BTN_UP)) {
            oled_print(0, "UP pressed", FONT_STANDARD);
        }
        if (button_pressed(BTN_DOWN)) {
            oled_print(1, "DOWN pressed", FONT_STANDARD);
        }
        oled_refresh();
    }
}
```

### USB Communication Test

```python
# test_usb.py
import hid

# Find device
device = hid.device()
device.open(0x1209, 0x5301)  # VID:PID

# Send ping
ping_msg = b'\x00\x00\x00\x01'  # Message type: PING
device.write(ping_msg)

# Read response
response = device.read(64, timeout=1000)
print(f"Response: {response.hex()}")

device.close()
```

---

## 🏭 Production Considerations

### 1. Security Measures

```
✅ Secure Boot (verify firmware signature)
✅ Read Protection Level 2 (RDP2) - no debug access
✅ Flash encryption (if supported)
✅ Tamper detection (mesh on PCB)
✅ Firmware update authentication
✅ Random number generator (TRNG)
```

### 2. Quality Control

```
✅ Burn-in test (24 hours @ 85°C)
✅ USB compliance test
✅ Display test (dead pixels)
✅ Button test (click lifetime)
✅ Firmware verification
✅ Secure element provisioning
```

### 3. Certifications

```
✅ CE (Europe)
✅ FCC (USA)
✅ RoHS (lead-free)
✅ WEEE (waste disposal)
```

### 4. Manufacturing Process

```
1. PCB fabrication (4-layer recommended)
2. SMT assembly
3. Programming (bootloader + firmware)
4. Secure element provisioning
5. Testing (automated)
6. Case assembly
7. Final QC
8. Packaging
```

---

## 💰 Cost Analysis

### Development Costs (One-time)

| Item | Cost |
|------|------|
| PCB Design | $2,000 - $5,000 |
| Firmware Development | $20,000 - $50,000 |
| Case Design (3D) | $1,000 - $3,000 |
| Certification (CE/FCC) | $10,000 - $20,000 |
| Testing Equipment | $5,000 - $10,000 |
| **Total** | **$38,000 - $88,000** |

### Production Costs (Per Unit)

| Quantity | Unit Cost | Notes |
|----------|-----------|-------|
| 100 | $30-40 | Prototype |
| 1,000 | $18-25 | Small batch |
| 10,000 | $12-18 | Production |
| 100,000+ | $8-12 | Mass production |

---

## 📝 Checklist - Özel Hardware

### Tasarım
- [ ] Schematic çizildi
- [ ] PCB layout yapıldı
- [ ] Gerber dosyaları oluşturuldu
- [ ] BOM listesi hazırlandı
- [ ] Case tasarımı yapıldı (3D model)

### Firmware
- [ ] Trezor firmware fork edildi
- [ ] Board config oluşturuldu
- [ ] Display driver yazıldı
- [ ] Secure element entegre edildi
- [ ] USB protocol implement edildi
- [ ] Test firmware çalıştı

### Üretim
- [ ] PCB üretim partneri bulundu
- [ ] SMT assembly partneri bulundu
- [ ] Case üretim yöntemi belirlendi
- [ ] Firmware flashing prosedürü oluşturuldu
- [ ] QC testleri tanımlandı

### Sertifikasyon
- [ ] CE test başvurusu yapıldı
- [ ] FCC test başvurusu yapıldı
- [ ] Test raporları alındı
- [ ] Sertifikalar alındı

---

## 🔗 Kaynaklar

### Hardware
- [STM32 Reference Manuals](https://www.st.com/en/microcontrollers-microprocessors/stm32f4-series.html)
- [ATECC608A Datasheet](https://www.microchip.com/wwwproducts/en/ATECC608A)
- [SSD1306 OLED Datasheet](https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf)

### Firmware
- [Trezor Firmware GitHub](https://github.com/trezor/trezor-firmware)
- [Trezor Crypto Library](https://github.com/trezor/trezor-crypto)
- [BIP32/39/44 Standards](https://github.com/bitcoin/bips)

### Tools
- [STM32CubeMX](https://www.st.com/en/development-tools/stm32cubemx.html)
- [KiCad](https://www.kicad.org/) - PCB design
- [FreeCAD](https://www.freecadweb.org/) - Case design

---

**Not:** Özel hardware geliştirme ciddi bir yatırım gerektirir. Öncelikle Trezor hardware kullanarak pazar testi yapmanız önerilir!
