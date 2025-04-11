-- keymaps_to_json.lua - Extract all keymaps in Neovim to JSON format
local M = {}

-- Function to get all keymaps
function M.get_all_keymaps()
	local modes = { "n", "v", "x", "s", "o", "i", "c", "t" }
	local all_keymaps = {}

	for _, mode in ipairs(modes) do
		-- Get keymaps for current mode
		local mode_maps = vim.api.nvim_get_keymap(mode)

		-- Add mode information to each keymap
		for _, keymap in ipairs(mode_maps) do
			keymap.mode_name = ({
				n = "Normal",
				v = "Visual/Select",
				x = "Visual",
				s = "Select",
				o = "Operator-pending",
				i = "Insert",
				c = "Command-line",
				t = "Terminal",
			})[mode] or mode

			table.insert(all_keymaps, keymap)
		end
	end

	return all_keymaps
end

-- Function to convert keymaps to JSON
function M.keymaps_to_json()
	local keymaps = M.get_all_keymaps()

	-- Process keymaps to make them more readable
	local processed_keymaps = {}
	for _, keymap in ipairs(keymaps) do
		-- Create a simplified representation
		local simple_map = {
			mode = keymap.mode,
			mode_name = keymap.mode_name,
			lhs = keymap.lhs,
			rhs = keymap.rhs or keymap.callback,
			desc = keymap.desc,
			noremap = keymap.noremap,
			silent = keymap.silent,
			expr = keymap.expr,
			buffer = keymap.buffer,
			script = keymap.script,
			nowait = keymap.nowait,
		}

		-- If it's a Lua function, indicate that
		if keymap.callback and not keymap.rhs then
			simple_map.rhs = "[Lua function]"
		end

		table.insert(processed_keymaps, simple_map)
	end

	-- Convert to JSON
	local status, json_output = pcall(vim.fn.json_encode, processed_keymaps)
	if not status then
		return '{"error": "Failed to encode to JSON"}'
	end

	return json_output
end

-- Function to write keymaps to a file
function M.write_keymaps_to_file(filepath)
	local json = M.keymaps_to_json()
	local file = io.open(filepath, "w")
	if file then
		file:write(json)
		file:close()
		print("Keymaps written to " .. filepath)
		return true
	else
		print("Failed to open file for writing: " .. filepath)
		return false
	end
end

-- Export to a file in the current directory
M.write_keymaps_to_file(vim.fn.getcwd() .. "/neovim_keymaps.json")

return M
