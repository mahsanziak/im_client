// pages/_app.tsx
import { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/Layout'; // Import the Layout component

function MyApp({ Component, pageProps }: AppProps) {
  return (
    
      <Component {...pageProps} />
    
  );
}

export default MyApp;
