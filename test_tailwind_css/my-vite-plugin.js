// my-vite-plugin.js
export default function myVitePlugin(options) {
  return {
    name: 'my-vite-plugin', // Name of your plugin (required)

    // Vite config hooks
    config() {
      // Modify Vite config if necessary
    },

    // Vite-specific build hooks
    transform(code, id) {
      // Process each file when it is transformed
      // 'code' is the file content, 'id' is the file path
      return code;
    },

    // Other Rollup hooks can be used here as well
    // More info: https://rollupjs.org/guide/en/#build-hooks
  };
}
