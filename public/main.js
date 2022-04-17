

$(".navbar").css("background-color","#B8FFF9")


// disable mousewheel on a input number field when in focus
// (to prevent Chromium browsers change the value when scrolling)
$('form').on('focus', 'input[type=number]', function (e) {
  $(this).on('wheel.disableScroll', function (e) {
    e.preventDefault()
  })
})

$('form').on('blur', 'input[type=number]', function (e) {
  $(this).off('wheel.disableScroll')
})


for (var i = 0; i < 4; i++) {
  if ($(".individualBalance")[i].innerHTML < 0) {
    $(".individualBalance")[i].style.color = 'red';
  }
}
