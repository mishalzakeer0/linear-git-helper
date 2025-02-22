# Linear Git Helper

## Overview
Linear Git Helper is a VS Code extension that integrates **Linear** and **Git**, allowing automatic branch switching when assigned tickets change.

## Features
- Automatically switches branches based on assigned Linear tickets.
- Handles branch creation from ticket names.
- Ensures a smooth workflow without unnecessary branch duplication.

## Installation
1. Install the extension from the VS Code Marketplace.
2. Set your **Linear API Key** when prompted.
3. Use the command `Linear: Sync Branch` to update branches.

## Usage
- When a new Linear ticket is assigned to you, the extension will **create and switch** to a branch automatically.
- If the ticket is removed, it switches back to the **development branch**.

## Requirements
- A Linear API Key.
- Git installed on your system.

## Configuration
Ensure you have your **Linear API Key** set up in VS Code settings or via the prompt on first activation.

## License
MIT License.
