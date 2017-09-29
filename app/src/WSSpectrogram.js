import { Component } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'react-wavesurfer';

class Spectrogram extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this._map = undefined;

    // on('ready') returns an event descriptor which is an
    // object which has the property un, which is the un method
    // properly bound to this callback, we cache it and can call
    // it alter to just remove this event listener
    this._readyListener = this.props.wavesurfer.on('ready', () => {
      this._init();
    });
  }

  componentWillUnmount() {
    this._readyListener.un();
  }

  _init() {
    this._map = Object.create(WaveSurfer.Spectrogram);
    this._map.init(this.props.wavesurfer, this.props.options);
    this._map.render();
  }

  render() {
    return false;
  }
}

Spectrogram.propTypes = {
  isReady: PropTypes.bool.isRequired,
  options: PropTypes.object.isRequired,
  wavesurfer: PropTypes.object
};

Spectrogram.defaultProps = {
  isReady: false,
  options: {}
};

export default Spectrogram;