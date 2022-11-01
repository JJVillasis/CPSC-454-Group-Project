var names = ['https://picsum.photos/300/200', 'https://picsum.photos/300/200', 'https://picsum.photos/300/200', 'https://picsum.photos/300/200'] // used to generate posts for this tutorial
const getPosts = (number) => {
  // generate a number of posts
  // in a real setting, this would be a database call or algorithm
  let ret = []
  for (var i = 0; i < number; i++) {
    ret.push({
      imgURL: names[i % names.length],
      caption:
        'Caption goes here!',
    })
  }
  return ret
}
export default getPosts
