import Layout from "@/components/Layout"
// import { ChakraProvider } from "@chakra-ui/react";
import { Nunito } from 'next/font/google'
import '../styles/globals.css'
// import BackToTop from "@/components/Page Components/BackToTop";
import { appWithTranslation } from 'next-i18next';


//Changing subset of 'Nunito' font to latin and setting it to its own variable
const nunito = Nunito({
  subsets: ['latin'],
})

const MyApp = ({ Component, pageProps }) => (
//   <ChakraProvider>
    <main >
      <Layout>
        <Component {...pageProps} />
        {/* <BackToTop /> */}
      </Layout>
    </main>
//   </ChakraProvider>
)

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
