export async function getUserData() {
    let result = await fetch("http://localhost/proj2/php/userData.php", {
        credentials: "include"
    })
    return result.json()
}