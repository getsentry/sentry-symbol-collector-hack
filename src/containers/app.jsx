import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadApp } from 'actions/app';
import styles from './app.scss';
import Editor from './editor/editor';
import Hero from './hero/hero';
import Section from './section/section';
import Uploader from './uploader/uploader';

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

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <Hero>
            <h1>Symbolicate your system symbols</h1>
            <h2>paste our upload your apple crash report</h2>
          </Hero>
        </div>
        <div className={styles.row}>
          <Section>
            <Uploader />
          </Section>
        </div>
        <div className={styles.growRow}>
          <Section hazy={true}>
            <Editor />
          </Section>
        </div>
        <div className={styles.row}>
          <Section>
            <h3>Want to help us providing even better stacktraces?</h3>
            <p>Paste this command into your shell, this will look for symbols on your system and upload them to us.</p>
            <pre>
              curl -sL https://raw.githubusercontent.com/HazAT/sentry-symbolicator/master/get-symboluploader.sh | bash
            </pre>
            <p>We also have something for your efforts, here is a 🍩</p>
          </Section>
        </div>
        <footer className={styles.footer}>
          <p>© 2017 • Sentry is a registered trademark of Functional Software, Inc.</p>
        </footer>
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
