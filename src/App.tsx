import { useState } from "react";
import styles from "./App.module.scss";

import Hobbies from "@/sections/Hobbies/Hobbies.component";
import Hero from "@/sections/Hero/Hero.component";
import Navbar from "@/sections/Navbar/Navbar.component";
import Skills from "@/sections/Skills/Skills.component";
import Projects from "@/sections/Projects/Projects.component";
import MyServices from "@/sections/MyServices/MyServices.component";
import WorkExperience from "@/sections/WorkExperience/WorkExperience.component";
import Contact from "@/sections/Contact/Contact.component";
import Footer from "@/sections/Footer/Footer.component";

const App = () => {
  const [activeSection, setActiveSection] = useState("hero");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.appContainer}>
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />

      <main className={styles.mainContent}>
        <Hero scrollTo={scrollTo} />
        <Skills />
        <Projects />
        <MyServices />
        <WorkExperience />
        <Hobbies />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default App;
