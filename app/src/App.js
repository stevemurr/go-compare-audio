import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import Meyda from 'meyda';
import "./App.css";

class Audio extends Component {
  constructor(props) {
    super();
    this.state = {
      playing: false,
      pos: 0,
      audioFeatures: {
        rms: 0,
        energy: 0
      }
    };
    this.handleTogglePlay = this
      .handleTogglePlay
      .bind(this);
    this.handlePosChange = this
      .handlePosChange
      .bind(this);
  }
  handleTogglePlay() {
    this.setState({
      playing: !this.state.playing
    });
  }
  componentDidMount() {
    this.getProps();
  }
  handlePosChange(e) {
    this.setState({pos: e.originalArgs[0]});
  }
  getProps() {
    fetch(this.props.floatFile).then((res) => {
      return res.json();
    }).then((j) => {
      var read = 0;
      var frame = 0;
      var results = {
        rms: 0.0,
        energy: 0.0,
        spectralKurtosis: 0.0,
        loudness: 0.0
      };
      while (read < j.length) {
        var end = read + 512
        if (end > j.length) {
          break
        }
        var r = Meyda.extract(["rms", "energy", "loudness", "spectralKurtosis", "perceptualSharpness"], j.slice(read, end))
        results["rms"] += Math.log10(r.rms) * 20
        results["energy"] += r.energy;
        results["loudness"] += r.loudness.total;
        results["spectralKurtosis"] += r.spectralKurtosis;
        read += 512
        frame++;
      }
      results["rms"] = (results["rms"] / frame).toFixed(2);
      results["energy"] = (results["energy"] / frame).toFixed(2);
      results["loudness"] = (results["loudness"] / frame).toFixed(2);

      results["spectralKurtosis"] = (results["spectralKurtosis"] / frame).toFixed(2);
      this.setState({audioFeatures: results})
    })
  }
  render() {
    var playState = this.state.playing
      ? "Pause"
      : "Play"
    return (
      <div className="card">
      <header className="card-header">
        <p className="card-header-title">
        {this.props.filename}
        </p>
        <a className="card-header-icon" href="http://www.google.com" target="_blank">
          <span className="icon">
            <i className="fa fa-angle-down"></i>
          </span>
        </a>
      </header>
      <div className="card-content">
        <div className="content">
        <Wavesurfer
          audioFile={this.props.audioFile}
          pos={this.state.pos}
          onPosChange={this.handlePosChange}
          playing={this.state.playing}
          onFinish={this.handleTogglePlay} />
          <br />
        </div>
      </div>
      <footer className="card-footer">
        <a className="card-footer-item">RMS: {this.state.audioFeatures.rms}</a>
        <a className="card-footer-item">EGRY: {this.state.audioFeatures.energy}</a>
        <a className="card-footer-item">KRT: {this.state.audioFeatures.spectralKurtosis}</a>
        <a className="card-footer-item">LD: {this.state.audioFeatures.loudness}</a>
        <a className="card-footer-item" onClick={this.handleTogglePlay}>{playState}</a>
      </footer>

    </div>
    )
  }
}

class Folder extends Component {
  constructor(props) {
    super();
    this.handleAnalyze = this
      .handleAnalyze
      .bind(this);
    this.handleChange = this
      .handleChange
      .bind(this);
    this.state = {
      value: "/Users/murr/experiments/dede/1",
      folder: [],
      waves: [],
      config: "",
    }
  }

  handleAnalyze() {
    const fd = new FormData()
    fd.append("path", this.state.value);
    fetch("http://localhost:1323/api", {
      method: "POST",
      body: fd
    }).then((res) => {
      return res.json();
    }).then((j) => {
      this.setState({waves: j.waves, wavesFiles: j.wavesFiles, config: j.config, spectrograms: j.spectrograms})
    })
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  render() {
    return (
      <div className="column">
        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              value={this.state.value}
              onChange={this.handleChange}
              className="input"
              type="text"
              placeholder="/Users/murr/experiments/dede/1"/>
          </div>
          <div className="control">
            <button onClick={this.handleAnalyze} className="button is-primary">Analyze</button>
            <button
              id={this.props.id}
              onClick={this.props.onClick}
              className="button is-danger">Remove</button>
          </div>
        </div>
        {this
          .state
          .waves
          .map((el, idx) => {
            return <Audio
              config={[this.state.config]}
              key={idx}
              spectrogram={"http://localhost:1323/api/files/" + this.state.spectrograms[idx]}
              filename={this.state.wavesFiles[idx]}
              audioFile={"http://localhost:1323/api/files/" + el} 
              floatFile={"http://localhost:1323/api/files/floats/" + el}
              />
          })}

      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super();
    this.deleteFolder = this
      .deleteFolder
      .bind(this);
    this.addFolder = this
      .addFolder
      .bind(this);
    this.state = {
      folders: [],
      uniqueKey: 0,
    }
  }

  addFolder() {
    const nf = this.state.folders;
    const newKey = this.state.uniqueKey++;
    nf.push({key: newKey, value: <Folder key={newKey} id={newKey} onClick={this.deleteFolder}/>});
    this.setState({folders: nf})
  }

  deleteFolder(e) {
    const del = e.target.id;
    var nf = this.state.folders.filter((el, idx) => {
      if (el.key != del) {
        return el;
      }
    })
    this.setState({folders: nf})
  }

  render() {
    return (
      <div >
        <button
          onClick={this.addFolder}
          className="button is-fullwidth is-info is-large">Add Folder +</button>
        <div className="columns">
          {this
            .state
            .folders
            .map((el, idx) => {
              return el.value; 
            })}
        </div>
      </div>
    );
  }
}

export default App;
