export async function getUserData() {
    let result = await fetch("http://localhost/CPS630-React/php/userData.php", {
        credentials: "include"
    })
    return result.json()
}