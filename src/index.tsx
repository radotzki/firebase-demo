import * as React from "react";
import { render } from "react-dom";
import firebase from "firebase";
import "./styles.css";

const DEFAULT_PROFILE_PICTURE =
  "https://eadb.org/wp-content/uploads/2015/08/profile-placeholder.jpg";
const DEFAULT_DISPLAY_NAME = "Anonymous";

const config = {
  apiKey: "AIzaSyCEK33YV_tzgO9mAUmFTb9fVT14v114QQg",
  authDomain: "radotzki-firebase-demo.firebaseapp.com",
  databaseURL: "https://radotzki-firebase-demo.firebaseio.com",
  projectId: "radotzki-firebase-demo",
  storageBucket: "radotzki-firebase-demo.appspot.com",
  messagingSenderId: "7609579504"
};
firebase.initializeApp(config);

interface IState {
  displayName: string;
  profilePicture: string;
  input: string;
  successMessage: string;
  numberOfTries: number;
  winner: { name: string; photoUrl: string; text: string } | null;
}

class App extends React.Component<{}, IState> {
  state: IState = {
    displayName: "",
    profilePicture: "",
    input: "",
    successMessage: "",
    numberOfTries: 0,
    winner: null
  };

  async componentDidMount() {
    this.listenToAuthStateChanged();
    this.listenToNumberOfTries();
    this.listenToWinner();
  }

  listenToAuthStateChanged = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          displayName: user.displayName || DEFAULT_DISPLAY_NAME,
          profilePicture: user.photoURL || DEFAULT_PROFILE_PICTURE
        });
      }
    });
  };

  listenToNumberOfTries = () => {
    firebase
      .database()
      .ref("tries")
      .on("value", snapshot => {
        if (snapshot) {
          this.setState({ numberOfTries: snapshot.val() || 0 });
        }
      });
  };

  listenToWinner = () => {
    firebase
      .database()
      .ref("winner")
      .on("value", snapshot => {
        if (snapshot) {
          this.setState({ winner: snapshot.val() });
        }
      });
  };

  signin = () => {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };

  onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await firebase
      .database()
      .ref("messages")
      .push({
        name: this.state.displayName,
        text: this.state.input,
        photoUrl: this.state.profilePicture
      });
    this.setState({ input: "", successMessage: "Your guess was submitted!" });
    setTimeout(() => this.setState({ successMessage: "" }), 2500);
  };

  renderSignin = () => {
    return <button onClick={this.signin}>Sign in</button>;
  };

  renderGame = () => {
    return (
      <div>
        <p>{this.state.displayName}, please enter your guess:</p>
        <form onSubmit={this.onSubmit}>
          <input
            type="number"
            onChange={e => this.setState({ input: e.target.value })}
            value={this.state.input}
          />
          <button>Send</button>
        </form>
        <p>{this.state.successMessage}</p>
        <p>Total number of tries: {this.state.numberOfTries}</p>
      </div>
    );
  };

  renderWinner = () => {
    return (
      <div>
        <p>The winner is:</p>
        <img src={this.state.winner!.photoUrl} />
        <p>{this.state.winner!.name}</p>
      </div>
    );
  };

  render() {
    return (
      <div className="App">
        <h1>Firebase Demo</h1>
        {this.state.winner
          ? this.renderWinner()
          : this.state.displayName
          ? this.renderGame()
          : this.renderSignin()}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
