$(function() {
  var socket = io();
  $('.form-chat').submit(function() {
    socket.emit('chat message', $("input[name='message']").val());
    $("input[name='message']").val('');
    return false;
  });
  socket.on('chat message', function(message) {
    $('.message-list').append($('<li>').text(message));
  });
});
