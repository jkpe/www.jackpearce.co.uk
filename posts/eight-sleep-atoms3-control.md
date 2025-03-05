---
title: "Controlling Eight Sleep with an ATOMS3 Dev Kit"
slug: eight-sleep-atoms3-control
date: 2025-01-03T19:00:00.000Z
excerpt: A hardware interface for Eight Sleep temperature control using an ATOMS3 Dev Kit, displaying current bed temperature, sleep stage, and bed state on a small screen with button control for temperature adjustments through Home Assistant.
category: "Home Automation"
---

The Eight Sleep mattress is amazing for temperature control, but the app-based adjustment isn't ideal at night.

I wanted a simpler way to control my Eight Sleep mattress during the night, without the hassle of unlocking my phone and navigating the app. That’s when I had the idea to use the ATOMS3 Dev Kit to create a small, dedicated button for temperature control. This tiny ESP32 device features an integrated display and button, making it perfect for the task.

The device shows the current temperature, target heating level, sleep stage, and bed state on its display. With a press of the button, you can cycle through predefined temperature settings, and it integrates seamlessly with Home Assistant for enhanced automation and control.

If you have ideas for improving this setup or additional features you'd like to see, feel free to share your suggestions in the comments or the [Github Repo](https://github.com/jkpe/eight-sleep-m5stack-atoms3).

<img src="https://static.jackpearce.co.uk/images/posts/atoms3-eightsleep.jpeg" alt="Featured Image" style="max-width: 600px; width: 100%; height: auto; border-radius: 8px;">

## Features

- Displays:
  - Current bed temperature
  - Target heating level
  - Sleep stage (e.g., REM)
  - Bed state (e.g., Active)
- Toggle between pre-configured temperature settings with a button.
- Integration with Home Assistant for automation and control.

## Requirements

- **Hardware:**
  - [M5STACK ATOMS3 Dev Kit with 0.85" display (C123)](https://thepihut.com/products/atoms3-dev-kit-w-0-85-inch-screen)
  - Eight Sleep mattress
- **Software:**
  - ESPHome
  - Home Assistant
  - [Custom Eight Sleep integration](https://github.com/lukas-clarke/eight_sleep)

## Installation

1. **Set up ESPHome**:
   - Install ESPHome on your ATOMS3 Dev Kit.
   - Use the provided `atoms3.yml` configuration file.

2. **Configure Home Assistant**:
   - Install the custom Eight Sleep integration.
   - Add the necessary sensors and automations from the example configuration.

## Example ESPHome Configuration

```yaml
esphome:
  name: esphome-web-5c4f38
  friendly_name: 8sleep
  platformio_options:
    build_flags:
      - "-w" # https://docs.platformio.org/en/latest/projectconf/sections/env/options/build/build_flags.html


esp32:
  board: m5stack-atoms3
  variant: esp32s3
  framework:
    type: esp-idf
    version: 5.3.1
    platform_version: 6.9.0
    # Custom sdkconfig options
    sdkconfig_options: # https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/kconfig.html#config-compiler-disable-gcc12-warnings
      CONFIG_SPIFFS_DBG: n

wifi:
  networks:
    - ssid: !secret wifi_ssid
      password: !secret wifi_password
  id: wifi_id

logger:
  baud_rate: 0

api:
#  encryption:
#    key: "" # optional, recommended, generate here https://esphome.io/components/api.html

ota:
  platform: esphome

# esp32_ble_tracker:

# bluetooth_proxy:
#  active: false


i2c:
  - id: bus_a
    sda: GPIO38
    scl: GPIO39

sensor:
#  - platform: mpu6886
#    address: 0x68
#    accel_x:
#      name: "$device_name MPU6886 Accel X"
#    accel_y:
#      name: "$device_name MPU6886 Accel Y"
#    accel_z:
#      name: "$device_name MPU6886 Accel Z"
#    gyro_x:
#      name: "$device_name MPU6886 Gyro X"
#    gyro_y:
#      name: "$device_name MPU6886 Gyro Y"
#    gyro_z:
#      name: "$device_name MPU6886 Gyro Z"
#    temperature:
#      name: "$device_name MPU6886 Temperature"
#  - platform: wifi_signal
#    name: "WiFi Signal Sensor"
#    update_interval: 120s

  # Home Assistant sensors
  - platform: homeassistant
    name: "Temperature"
    entity_id: sensor.jack_bed_state_template
    id: temperature
    unit_of_measurement: ""

  - platform: homeassistant
    name: "Target Heating Level"
    entity_id: sensor.8_sleep_target_temperature_template
    id: target_heating_level
    unit_of_measurement: "" 

text_sensor:
  - platform: homeassistant
    name: "Sleep Stage"
    entity_id: sensor.jack_s_eight_sleep_side_sleep_stage
    id: sleep_stage

  - platform: homeassistant
    name: "Bed State Type"
    entity_id: sensor.8_sleep_bed_state_template
    id: bed_state_type

spi:
  clk_pin: GPIO17
  mosi_pin: GPIO21

color:
  - id: my_red
    red: 100%
    green: 0%
    blue: 0%
  - id: my_green
    red: 0%
    green: 100%
    blue: 0%
  - id: my_gray
    red: 50%
    green: 50%
    blue: 50%
  - id: my_black
    red: 0%
    green: 0%
    blue: 0%
  - id: my_white
    red: 100%
    green: 100%
    blue: 100%

font:
  - file: "gfonts://Roboto"
    id: roboto_32
    size: 32
  - file: "gfonts://Roboto"
    id: roboto_24
    size: 24
  - file: "gfonts://Roboto"
    id: roboto_18
    size: 18
  - file: "gfonts://Roboto"
    id: roboto_12
    size: 12

output:
  - platform: ledc
    pin: 16
    min_power: 0.30
    max_power: 0.99
    zero_means_zero: true
    id: backlightdim

light:
  - platform: monochromatic
    output: backlightdim
    restore_mode: RESTORE_DEFAULT_ON
    name: "Backlight"
    id: backlightlight

display:
  - platform: ili9xxx
    model: ST7789V
    id: disp
    cs_pin: 15
    dc_pin: 33
    reset_pin: 34
    rotation: 0
    invert_colors: true
    update_interval: 1s
    dimensions:
      height: 128
      width: 128
      offset_height: 1
      offset_width: 2
    lambda: |-
      it.fill(id(my_black));  // Fill the background with black using defined color

      // Print "8sleep" at the top
      it.print(0, 0, id(roboto_24), id(my_white), "8sleep");

      // Print Temperature without "°C"
      if (!isnan(id(temperature).state)) {
        it.printf(0, 24, id(roboto_18), id(my_white), "Temp: %.1f", id(temperature).state);
      } else {
        it.print(0, 24, id(roboto_18), id(my_white), "Temp: N/A");
      }

      // Print Target Heating Level
      if (!isnan(id(target_heating_level).state)) {
        it.printf(0, 48, id(roboto_18), id(my_white), "Target: %.1f", id(target_heating_level).state);
      } else {
        it.print(0, 48, id(roboto_18), id(my_white), "Target: N/A");
      }

      // Print Sleep Stage
      if (!id(sleep_stage).state.empty()) {
        it.printf(0, 72, id(roboto_18), id(my_white), "Stage: %s", id(sleep_stage).state.c_str());
      } else {
        it.print(0, 72, id(roboto_18), id(my_white), "Stage: N/A");
      }

      // Print Bed State Type
      if (!id(bed_state_type).state.empty()) {
        it.printf(0, 96, id(roboto_18), id(my_white), "State: %s", id(bed_state_type).state.c_str());
      } else {
        it.print(0, 96, id(roboto_18), id(my_white), "State: N/A");
      }


binary_sensor:
  - platform: gpio
    name: Button
    pin:
      number: GPIO41
      inverted: true
      mode:
        input: true
        pullup: true
    filters:
      - delayed_off: 10ms
    on_press:
      then:
        - logger.log: Button Pressed
```

## Home Assistant Configuration

### Templates

1. **Bed State Shortening**:
   This template shortens the bed state string so it fits neatly on the display. For example, if the state is `Bed State: Active`, it extracts `Active`.

   ```yaml
   {% set state = states('sensor.jack_s_eight_sleep_side_bed_state_type') %}
   {{ state.split(':')[1] if ':' in state else state }}
   ```

2. **Percentage to App Scale Conversion**:
   This template converts the sensor's -100% to 100% range into the app's -10 to 10 scale, rounding to the nearest whole number.

   ```yaml
   {% set value = states('sensor.jack_s_eight_sleep_side_bed_state') | float %}
   {% set mapped_value = ((value / 100) * 10) | round %}
   {{ mapped_value }}
   ```

3. **Input Select Helper**:
   This helper lets you define a dropdown menu with options like `-2`, `-1`, `0`, and `1`, representing your preferred temperature settings. You can cycle through these options using the button on the ATOMS3.

### Automations

1. **Display Auto-Off**:
   This automation turns off the display backlight 30 seconds after the button is released, helping avoid unnecessary light during the night.

   ```yaml
   alias: 8sleep display auto off
   description: ""
   triggers:
     - trigger: state
       entity_id:
         - binary_sensor.esphome_web_5c4f38_button
       to: "off"
       for:
         hours: 0
         minutes: 0
         seconds: 30
       from: "on"
     - trigger: state
       entity_id:
         - binary_sensor.esphome_web_5c4f38_button
       to: "off"
       for:
         hours: 0
         minutes: 0
         seconds: 30
       from: unavailable
   conditions: []
   actions:
     - action: light.turn_off
       metadata: {}
       data: {}
       target:
         entity_id: light.esphome_web_5c4f38_backlight
   mode: single
   ```

2. **Cycle Temperature Options**:
   This automation adjusts the Eight Sleep bed's temperature based on the currently selected temperature option. For instance, selecting `-2` lowers the temperature significantly, while `1` raises it slightly.

   ```yaml
   alias: 8sleep - send temperatures to Eight Sleep API
   description: "Checks that the bed is not off (to prevent accidental clicks while the Eight Sleep is off, and then sends a temperature selection to Eight Sleep API"
   triggers:
     - trigger: state
       entity_id:
         - input_select.eight_sleep_temperature_choices
       to: "-2"
       id: "-2"
       for:
         hours: 0
         minutes: 0
         seconds: 10
     - trigger: state
       entity_id:
         - input_select.eight_sleep_temperature_choices
       to: "-1"
       id: "-1"
       for:
         hours: 0
         minutes: 0
         seconds: 10
     - trigger: state
       entity_id:
         - input_select.eight_sleep_temperature_choices
       to: "0"
       id: "0"
       for:
         hours: 0
         minutes: 0
         seconds: 10
     - trigger: state
       entity_id:
         - input_select.eight_sleep_temperature_choices
       to: "1"
       id: "1"
       for:
         hours: 0
         minutes: 0
         seconds: 10
   conditions:
     - condition: not
       conditions:
         - condition: state
           entity_id: sensor.jack_s_eight_sleep_side_bed_state_type
           state: "off"
   actions:
     - choose:
         - conditions:
             - condition: trigger
               id:
                 - "-2"
           sequence:
             - action: eight_sleep.heat_set
               target:
                 entity_id: sensor.jack_s_eight_sleep_side_bed_temperature
               data:
                 sleep_stage: bedTimeLevel
                 target: -20
                 duration: 0
         - conditions:
             - condition: trigger
               id:
                 - "-1"
           sequence:
             - action: eight_sleep.heat_set
               target:
                 entity_id: sensor.jack_s_eight_sleep_side_bed_temperature
               data:
                 sleep_stage: current
                 target: -10
                 duration: 0
         - conditions:
             - condition: trigger
               id:
                 - "0"
           sequence:
             - action: eight_sleep.heat_set
               target:
                 entity_id: sensor.jack_s_eight_sleep_side_bed_temperature
               data:
                 sleep_stage: current
                 target: 0
                 duration: 0
         - conditions:
             - condition: trigger
               id:
                 - "1"
           sequence:
             - action: eight_sleep.heat_set
               target:
                 entity_id: sensor.jack_s_eight_sleep_side_bed_temperature
               data:
                 sleep_stage: current
                 target: 10
                 duration: 0
   mode: single
   ```

3. **Temperature Control**:
   This automation cycles through your predefined temperature settings (`-2`, `-1`, `0`, `1`) each time the button is pressed. If the backlight is off, the first press turns it on instead.

   ```yaml
   alias: 8sleep - Wake display and cycle through temperatures
   description: ""
   triggers:
     - trigger: state
       entity_id:
         - binary_sensor.esphome_web_5c4f38_button
       from: "off"
       to: "on"
   conditions: []
   actions:
     - if:
         - condition: state
           entity_id: light.esphome_web_5c4f38_backlight
           state: "off"
       then:
         - action: light.turn_on
           metadata: {}
           data: {}
           target:
             entity_id: light.esphome_web_5c4f38_backlight
       else:
         - action: input_select.select_next
           metadata: {}
           data:
             cycle: true
           target:
             entity_id: input_select.eight_sleep_temperature_choices
   mode: single
   ```

If you have ideas for improving this setup or additional features you'd like to see, feel free to share your suggestions in the comments or the [Github Repo](https://github.com/jkpe/eight-sleep-m5stack-atoms3). Feedback is always welcome!
