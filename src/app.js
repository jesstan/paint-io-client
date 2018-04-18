import Button from './Button';
import ColorSelector from './ColorSelector';
import PaintCanvas from './PaintCanvas';
import Message from './Message';
import Panel from './Panel';
import './app.css';
import io from 'socket.io-client';

const socket = io();

/**
 * Creates a layout panel in a specified position. Other components can use
 * these as `mountPoint`s.
 * @param {'topLeft'|'topRight'|'bottomLeft'|'bottomRight'} [position] If
 *        specified, will position the element in that corner of the viewport.
 * @return {Panel} A Panel instance
 */
const createLayoutPanel = position =>
  new Panel({mountPoint: document.body, position});
const statusPanel = createLayoutPanel('topLeft'); // messages for users
const userPanel = createLayoutPanel('topRight'); // actions to interact with other users
const controlPanel = createLayoutPanel('bottomLeft'); // actions on the paint canvas

/**
 * Displays a status message
 *
 * @example Updating the status message
 * greet.write('my new message');
 *
 * @type {Message}
 * @property {Function} write update the message text
 */
const greet = new Message({
  text: 'Thank you for joining us!',
  prefix: '👋',
  mountPoint: statusPanel,
});

let username; // client username

// initialize paint canvas
const paintCanvas = new PaintCanvas({
  mountPoint: document.body,
  onMove({points, color}) {
    socket.emit("DRAW_POINTS", {points, color});
  },
});

socket.on("DRAW_POINTS", ({points, color}) => {
  paintCanvas.drawLine(points, color);
});

// create and render the color selector
new ColorSelector({
  mountPoint: controlPanel,
  onChange(e) {
    paintCanvas.changeColor(e.target.value);
  },
});
// create and render the clear button
new Button({
  text: 'Clear',
  variant: 'accent',
  mountPoint: controlPanel,
  onClick() {
    paintCanvas.clear();
  },
});

setTimeout(() => {
  // next tick
  username = prompt('Enter your username');
  greet.write(`Hello, ${username}.`);
});

const login = (message = 'Enter your username') => {
  username = prompt(message);
  socket.emit('LOGIN', {username}, login);
};
socket.on('connect', () => {
  login();
  greet.write(`Hello, ${username}.`);
});

const createUser = username => new Message({
  text: username,
  mountPoint: userPanel,
});
socket.on("UPDATE_USER_LIST", ({users}) => {
  userPanel.clear();
  Object.keys(users).map(createUser);
});

// TODO 3.1 Update the user list display from step 2.3 so that it displays buttons, when clicked, draw events will only be dispatched to that user. You will also need to modify the onMove handler from 1.3
// TODO 3.2 When a user is selected, filter draw events from other users and only display events from the selected user. You will likely need to update the "DRAW_POINTS" listener from 1.4
// TODO 3.3 Create a button that, when clicked, will send draw events to all users again.
