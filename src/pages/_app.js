import Layout from "@/components/Layout"
// import { ChakraProvider } from "@chakra-ui/react";
import { Nunito } from 'next/font/google'
import '../styles/globals.css'
// import BackToTop from "@/components/Page Components/BackToTop";
import { CartProvider } from '../contexts/CartContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { appWithTranslation } from 'next-i18next';
import '../lib/i18n';
import { ConsentProvider } from '../components/ConsentProvider';
import { useState, useEffect } from 'react';

//Changing subset of 'Nunito' font to latin and setting it to its own variable
const nunito = Nunito({
  subsets: ['latin'],
})

const MyApp = ({ Component, pageProps }) => {
  const [termsText, setTermsText] = useState('');

  useEffect(() => {
    // Fetch terms text from API
    const fetchTerms = async () => {
      try {
        const response = await fetch('/api/obshti-uslovia');
        const data = await response.json();
        setTermsText(data.terms);
      } catch (error) {
        console.error('Error fetching terms:', error);
        // Fallback terms text
        setTermsText(`
          <h1>ОБЩИ УСЛОВИЯ ЗА ПОЛЗВАНЕ И ПОКУПКА ПРЕЗ САЙТА BG-VIKI15.BG</h1>
          <p>За да използвате сайта, трябва да приемете общите условия.</p>
        `);
      }
    };

    fetchTerms();
  }, []);

  return (
    <ErrorBoundary>
      <main>
        <CartProvider>
          <ConsentProvider termsText={termsText}>
            <Layout>
              <Component {...pageProps} />
              {/* <BackToTop /> */}
            </Layout>
          </ConsentProvider>
        </CartProvider>
      </main>
    </ErrorBoundary>
  );
};

/**
 * 
 * Main App component that wraps the ChakraProvider and the Layout component, which is used to render the pages of the application. It also applies the 
 * Nunito font to the entire application using the Nunito function from the 'webfontloader' package.
 * @param {Object} props - The props object that contains the Component and pageProps properties that are passed to the Layout component.
 * @param {Object} props.Component - The component that is being rendered.
 * @param {Object} props.pageProps - The props object that is passed to the rendered component.
 * @returns {JSX.Element} - Returns the main component of the application, which is a ChakraProvider with a Layout component and a Component that is passed as a prop to the Layout component.
 */

export default appWithTranslation(MyApp);
