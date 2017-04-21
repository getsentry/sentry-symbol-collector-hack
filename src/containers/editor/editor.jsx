import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { changeCrashReport, resetCrashReport } from 'actions/editor';
import styles from './editor.scss';

type Props = {
  dispatch: () => void,
  crashReport: string,
  crashReportSymbolicated: string,
  error: string,
}

export class Editor extends Component {
  props: Props;

  changeCrashReport = (event) => {
    this.props.dispatch(changeCrashReport(event.target.value));
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 27) {
      this.props.dispatch(resetCrashReport());
    }
  }

  render() {
    const flipper = classnames({
      'flip-container': true,
      hover: this.props.crashReportSymbolicated !== ''
    });
    let error = null;
    if (error) {
      error = <h4 className={styles.error}>{this.props.error}</h4>;
    }
    return (
      <div className={styles.editor}>
        {error}
        <div className={styles.textContainer}>
          <div className={flipper}>
            <div className="flipper">
              <div className="front">
                <textarea value={this.props.crashReport} onChange={this.changeCrashReport} />
              </div>
              <div className="back">
                <textarea value={this.props.crashReportSymbolicated} readOnly onKeyDown={this.handleKeyDown} />
                <div className="hint">
                Press ESC to go back
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProperties(state) {
  return {
    crashReport: state.editor.crashReport,
    crashReportSymbolicated: state.editor.crashReportSymbolicated,
    error: state.editor.error,
  };
}

export default connect(mapStateToProperties)(Editor);
