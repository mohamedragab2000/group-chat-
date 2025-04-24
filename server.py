from websocket_server import Server, WebSocket
import  json
clients = []

class MySimpleServerApp(WebSocket):
    def handle_message(self):

        if isinstance(self.data, str):
            try:
                message_data = json.loads(self.data)
                if message_data.get('type') == 'join':
                    self.username = message_data.get('userInput', '')
                    join_notification = {
                        'type': 'join',
                        'userInput': self.username,
                        'connected_users': self.get_connected_users()
                    }
                    self.broadcast_message(json.dumps(join_notification))
                else :
                    for client in clients :
                        if client != self :

                            response = {
                                'type': 'message',
                                'messageCreator': message_data.get('messageCreator', ''),
                                'message': message_data.get('message', ''),
                                'connected_users': self.get_connected_users()
                            }
                            self.broadcast_message(json.dumps(response))
            except :
                print("there is problem in handling message")



    def handle_connected(self):

        print("new client is added handle")
        clients.append(self)
        self.send_message(self.data)


    def handle_close(self):
        if self in clients:
            clients.remove(self)
            print("Client disconnected")

            if hasattr(self, 'username'):
                disconnect_notification = {
                    'type': 'leave',
                    'userInput': self.username,
                    'connected_users': self.get_connected_users()
                }
                self.broadcast_message(json.dumps(disconnect_notification))


    def get_connected_users(self):
        users = []
        for client in clients:
            if hasattr(client, 'username'):
                users.append(client.username)
        return users


    def broadcast_message(self, message):
        for client in clients:
            client.send_message(message)


server = Server(host='localhost', port=8080, websocketclass=MySimpleServerApp)
print("server is started on localhost : 8080")
server.serveforever()