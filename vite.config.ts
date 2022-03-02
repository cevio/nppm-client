import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import usePluginImport from 'vite-plugin-importer';
import styleImport from 'vite-plugin-style-import';

// https://github.com/ajuner/vite-plugin-importer#use
const AntDesignImporterConfig = usePluginImport({
  libraryName: "antd",
  libraryDirectory: "es",
  style: true,
});


const styleImportConfig = styleImport({
  libs: [
    {
      libraryName: 'antd',
      esModule: true,
      resolveStyle: (name) => `antd/es/${name}/style/index`,
    }
  ]
})

const importerConfigs = process.env.NODE_ENV === 'production' ? [AntDesignImporterConfig] : [styleImportConfig];

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.less', '.css'],
  },
  define: {
    __VERSION__: JSON.stringify(require('./package.json').version)
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    }
  },
  plugins: [reactRefresh(), ...importerConfigs],
  server: {
    proxy: {
      '/~': {
        changeOrigin: true,
        target: 'http://127.0.0.1:3000',
      }
    }
  }
})
