import Header from './Layout Components/Header'
import Footer from './Layout Components/Footer'
//import Transition from './Layout Components/Transition'
import styles from '../styles/Component Styles/Layout.module.css'
import { Analytics } from "@vercel/analytics/react"

/**
 * A layout component that defines the overall structure of the web page
 * @param {object} props - The props object
 * @param {ReactNode} children - The child components to be rendered within the layout
 * @returns {JSX.Element} - The layout component
*/
const Layout = ({ children }) => {
  return (
    <>
      <div className={styles.layout}>
      <Analytics/>
        <Header />
        {/* <Transition> */}
        <main className={styles.main}>
          {children}
        </main>
        {/* </Transition> */}
        <Footer />
      </div>
    </>
  )
}

export default Layout