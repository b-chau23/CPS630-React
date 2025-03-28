interface personInfo {
    name: string,
    email: string,
    studentNum: string
    image: string
}

function AboutCard({name, email, studentNum, image}: personInfo) {
    return(
        <div className="team-member">
            <img src={image} alt={name} />
            <h3>{name}</h3>
            <p>{email}</p>
            <p>{studentNum}</p>
        </div>
    );
}

export default AboutCard;