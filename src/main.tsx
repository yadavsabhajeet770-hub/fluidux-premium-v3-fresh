import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyLowPerfClass } from './utils/devicePerf';

applyLowPerfClass();

createRoot(document.getElementById('root')!).render(<App />);
