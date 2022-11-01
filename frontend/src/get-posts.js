let lastNames = null;
const getPosts = (names, start, number) => {
  // generate a number of posts
  // in a real setting, this would be a database call or algorithm
  if (names)
    lastNames = names; // save database query results for later

  let ret = []
  for (let i = start; i < start + number; i++) {
    ret.push({
      imgURL: lastNames[i % lastNames.length], // this should the actual index
      caption:
        'Caption goes here!',
    })
  }
  return ret
}
export default getPosts
