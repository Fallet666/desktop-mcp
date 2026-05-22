# Desktop MCP Server

MCP-сервер для управления рабочим столом через клавиатуру, мышь и скриншоты.

## Требования

- **Node.js** 18+
- **Bun** (рекомендуется) или npm/yarn
- **GNOME Screenshot** (для скриншотов в Wayland): `gnome-screenshot`
- **Linux**: `libxtst-dev`, `libpng-dev` (для сборки robotjs)

## Установка

```bash
# Установка зависимостей
bun install
# или
npm install
```

## Настройка в opencode.json

Добавьте сервер в ваш `opencode.json`:

```json
{
  "mcpServers": {
    "desktop": {
      "command": "bun",
      "args": ["run", "/путь/к/desktop-mcp/desktop-mcp-server.js"]
    }
  }
}
```

Или напрямую через Node.js:

```json
{
  "mcpServers": {
    "desktop": {
      "command": "node",
      "args": ["/путь/к/desktop-mcp/desktop-mcp-server.js"]
    }
  }
}
```

Если сервер установлен глобально, можно просто:

```json
{
  "mcpServers": {
    "desktop": {
      "command": "opencode-desktop-mcp"
    }
  }
}
```

## Инструменты

| Инструмент | Описание | Параметры |
|---|---|---|
| `get_screen_size` | Получить размер экрана | — |
| `screen_capture` | Сделать скриншот | — |
| `keyboard_press` | Нажать клавишу | `key` (строка), `modifiers` (массив: control, shift, alt, command) |
| `keyboard_type` | Напечатать текст | `text` (строка) |
| `mouse_click` | Нажать кнопку мыши | `button` (left/right/middle), `double` (boolean) |
| `mouse_move` | Переместить мышь | `x` (число), `y` (число) |

## Примечания

- В Wayland скриншоты делаются через `gnome-screenshot`.
- `robotjs` требует системные библиотеки X11 для работы с клавиатурой/мышью.
