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
      <div className={styles.vContainer}>
        <Hero className={styles.row}>
          <h1>Symbolicate your system symbols</h1>
          <h2>paste or upload your apple crash report</h2>
        </Hero>
        <Section hazy={true} className={`${styles['inset-top-shadow']} ${styles.growRow} ${styles.vContainer}`}>
          <Uploader>
            <Editor />
          </Uploader>
        </Section>
        <Section className={styles.row}>
          <h3>Want to help us providing even better stacktraces?</h3>
          <p>Paste this command into your shell, this will look for symbols on your system and upload them to us.<br/>
          <i>You can trust us, we are engineers.</i>
          </p>
          <pre>
            curl -sL https://raw.githubusercontent.com/HazAT/sentry-symbolicator/master/get-symboluploader.sh | bash
          </pre>
          <p>We also have something for your efforts, here is a 🍩</p>
        </Section>
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
