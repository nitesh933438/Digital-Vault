import { useEffect, useState } from "react";
import "./ScrollToTop.css";
import { FaArrowUp } from "react-icons/fa";

function ScrollToTop() {

  const [visible, setVisible] = useState(false);

  useEffect(() => {

    const handleScroll = () => {

      if (window.scrollY > 300) {

        setVisible(true);

      } else {

        setVisible(false);

      }

    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);

  }, []);

  const scrollTop = () => {

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };

  return (

    visible && (

      <button
        className="scroll-top"
        onClick={scrollTop}
      >

        <FaArrowUp />

      </button>

    )

  );

}

export default ScrollToTop;