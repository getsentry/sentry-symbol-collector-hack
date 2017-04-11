import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { changeCrashReport, resetCrashReport } from 'actions/editor';
import styles from './editor.scss';

type Props = {
  dispatch: () => void,
  crashReport: string,
  crashReportSymbolicated: string,
}

export class Editor extends Component {
  props: Props;

  changeCrashReport(event) {
    this.props.dispatch(changeCrashReport(event.target.value));
  }

  handleKeyDown(event) {
    if (event.keyCode === 27) {
      this.props.dispatch(resetCrashReport());
    }
  }

  render() {
    let flipper = classnames({
      'flip-container': true,
      hover: this.props.crashReportSymbolicated !== ''
    })
    return (
      <div className={styles.editor}>
        <div className={styles.textContainer}>
        <div className={flipper}>
          <div className="flipper">
            <div className="front">
              <textarea value={this.props.crashReport} onChange={this.changeCrashReport.bind(this)} />
            </div>
            <div className="back">
              <textarea value={this.props.crashReportSymbolicated} readOnly={true} onKeyDown={this.handleKeyDown.bind(this)} />
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
  };
}

export default connect(mapStateToProperties)(Editor);
