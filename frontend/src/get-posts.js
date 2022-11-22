let lastNames = null;

/**
 * Generates new posts from a database query
 * @param names the items from the database
 * @param start the item to start with
 * @param number the number of posts to generate
 * @returns {*[]}
 */
const getPosts = (names, start, number) => {
  if (names)
    lastNames = names; // save database query results for later

  let ret = []
  if (number > lastNames.length)
    number = lastNames.length
  for (let i = start; i < start + number; i++) {
    ret.push({
      imgURL: lastNames[i].imgURL, // this should the actual index
      caption: lastNames[i].title,
      username: lastNames[i].username,
      likes: lastNames[i].likes,
      dislikes: lastNames[i].dislikes,
      tags: lastNames[i].tags,
      image_id: lastNames[i].image_id,
      userLikes: lastNames[i].userLikes
    })
  }
  console.log(ret)
  return ret
}
export default getPosts
