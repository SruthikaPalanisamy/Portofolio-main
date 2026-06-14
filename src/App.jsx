import React from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Experiences from "./sections/Experiences";
import Testimonial from "./sections/Testimonial";
import Contact from "./sections/Contact";
import Footer from './sections/Footer';
import LeetCodeActivity from "./sections/LeetCodeActivity";
 

const App = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1rem" }}>
        <LeetCodeActivity />
      </section>
      <Experiences />
      <Contact />
      <Footer/>
    </div>
  );
};

export default App;
