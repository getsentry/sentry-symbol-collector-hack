import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadApp } from 'actions/app';
import styles from './app.scss';
import stylesCodeMirror from './codemirror.scss';
import CodeMirror from 'react-codemirror';

type Props = {
  dispatch: () => void,
  loaded: boolean
}

export class AppContainer extends Component {
  componentDidMount() {
    this.props.dispatch(loadApp());
  }

  props: Props;

  render() {
    if (!this.props.loaded) {
      return null;
    }
    var options = {
      lineNumbers: true,
    };
    var code = "// Paste your Apple crash report here\n" +
               "// OR\n" +
               "// Drag & Drop your crash report";

    return (
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <CodeMirror value={code} options={options} />
        </div>
      </div>
    );
  }
}

function mapStateToProperties(state) {
  return {
    loaded: state.app.loaded
  };
}

export default connect(mapStateToProperties)(AppContainer);
