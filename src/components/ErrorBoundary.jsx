import { Component } from 'react';
import './ErrorBoundary.css';
import content from '../../content/en.json';

/**
 * Error boundary component to catch React errors and show recovery UI
 * instead of blank screens. Grief-appropriate messaging.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1 className="error-boundary__title">{content.errorBoundary.title}</h1>
            <p className="error-boundary__message">{content.errorBoundary.message}</p>
            {this.state.error && (
              <details className="error-boundary__details">
                <summary>Error details</summary>
                <pre className="error-boundary__error">{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-boundary__actions">
              <button
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleReset}
              >
                {content.errorBoundary.tryAgain}
              </button>
              <button
                className="error-boundary__button"
                onClick={() => window.location.reload()}
              >
                {content.errorBoundary.reload}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
