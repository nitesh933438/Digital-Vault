import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import Footer from "../../components/Footer/Footer";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import Stats from "../../components/Stats/Stats";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Testimonials from "../../components/Testimonials/Testimonials";
import FAQ from "../../components/FAQ/FAQ";
import Contact from "../../components/Contact/Contact";
import Newsletter from "../../components/Newsletter/Newsletter";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import WhatsAppButton from "../../components/WhatsAppButton/WhatsAppButton";
import CookieBanner from "../../components/CookieBanner/CookieBanner";
import About from "../../components/About/About";

function Home() {

return(

<>

<Navbar />
<Hero />
<Features />
<About />
<WhyChoose />
<Stats />
<HowItWorks />
<Testimonials />
<FAQ />
<Newsletter />
<Contact />
<Footer />
<ScrollToTop />
<WhatsAppButton />
<CookieBanner />

</>

);

}

export default Home;