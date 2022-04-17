module.exports = getDatee;

function getDatee(){
  let date = new Date();

  let options = {
    day: "numeric",
    month: "long",
    year : "numeric",
  }

  let update = date.toLocaleDateString("en-US",options);

  return update;

}
