import AboutCard from "../components/AboutCard";
import defaultImage from "../assets/Default_pfp.png";
import '../styles/about.css';

function About() {
    return(
        <div className="about">
            <h1>About Us</h1>
            <div className="team">
                <AboutCard
                    name="Eric Yuen"
                    email="eric1.yuen@torontomu.com"
                    studentNum="501181745"
                    image={defaultImage}
                    />
                <AboutCard
                    name="Steven Tee"
                    email="stee@torontomu.com"
                    studentNum="501139213"
                    image={defaultImage}
                    />
                <AboutCard
                    name="Bowie Chau"
                    email="bowie.chau@torontomu.com"
                    studentNum="501179245"
                    image={defaultImage}
                    />
            </div>
        </div>
    );
}

export default About;