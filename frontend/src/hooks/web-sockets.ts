// import { useEffect, useState } from 'react';
// import { useboardstore } from "../stores/board-store";

// const useNotificationCenter = () => {
//   useEffect(() => {
//     const websocket = new WebSocket('ws://localhost:8080');

//     websocket.onopen = () => console.log('Connected to WebSocket server');
//     websocket.onmessage = (event) => {
//         console.log(event.data)
//     };
//     websocket.onclose = () => console.log('Disconnected from WebSocket server');

//     return () => websocket.close();
//   }, []);
// };

// export default useNotificationCenter;