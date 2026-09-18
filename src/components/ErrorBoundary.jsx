import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError:false, error:null }
  }

  static getDerivedStateFromError(error) {
    return { hasError:true, error }
  }

  componentDidCatch(error,info) {
    console.error('Engineering Lab render error',error,info)
  }

  reset = () => {
    this.setState({hasError:false,error:null})
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="auth-screen">
        <div className="ambient ambient-a"/>
        <div className="ambient ambient-b"/>
        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-mark"><AlertTriangle size={22}/></div>
            <div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div>
          </div>
          <p className="eyebrow"><span className="pulse"/> RECOVERY MODE</p>
          <h1>The Lab hit an unexpected UI error.</h1>
          <p className="auth-copy">Your database records are not deleted by this screen. Reload the application to restart the interface.</p>
          <button className="primary" onClick={this.reset}><RotateCcw size={15}/> RELOAD LAB</button>
        </section>
      </main>
    )
  }
}
