import { Component } from 'react'
import FunctionForm from './function-form'
import OutputForm from './output-form'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { generate } from 'bson-objectid'

class RequestView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      clientType: undefined
    }
  }

  get clientType() {
    if (this.state.clientType) {
      return this.state.clientType
    } else {
      return 'http'
    }
  }

  get currentFunction() {
    return this.functions.filter(fn => fn.id === this.clientType)[0]
  }

  get functions() {
    if (this.props.functions.functions) {
      return this.props.functions.functions
    } else {
      return []
    }
  }

  onSubmit = code => {
    const variables = {
      id: generate(),
      input: code,
      functionId: this.currentFunction.id
    }
    this.props.onChange({requestId: variables.id})
    this.props.mutate({
      variables
    })
  }

  handleInputChange = ({clientType}) => {
    this.setState({clientType})
  }

  get input() {
    if (this.props.request && typeof this.props.request.input === 'string') {
      return this.props.request.input;
    }
  }

  get output() {
    if (this.props.request && typeof this.props.request.output === 'string') {
      return this.props.request.output;
    }
  }

  get loading() {
    if (!this.props.request) return false;
    const createdRequest = (this.props.request && this.props.request.id)
    return (createdRequest && this.output === null)
  }

  render() {
    return (
      <div className="page">
        <div className="function">
          <FunctionForm
            loading={this.loading}
            example={this.functions[0] && this.functions[0].example}
            input={this.input}
            onChange={this.handleInputChange}
            onSubmit={this.onSubmit}
          />
        </div>
        <div className="output">
          <OutputForm currentFunction={this.currentFunction} output={this.output} />
        </div>

        <style jsx>{`
          .page {
            height: 100vh;
            width: 100%;
          }
          .function {
            position: absolute;
            top: 0;
            bottom: 50%;
            left: 0;
            right: 0;
          }
          .output {
            position: absolute;
            top: 50%;
            bottom: 0;
            left: 0;
            right: 0;
          }
        `}</style>
      </div>
    )
  }
}

const CreateRequest = gql`
  mutation createRequest($id: ID!, $input: String!, $functionId: String!) {
    createRequest(
      id: $id,
      input: $input,
      functionId: $functionId
    ) {
      id,
      input,
      functionId,
      output
    }
  }
`

const RequestViewWithData = compose(
  graphql(CreateRequest)
)(RequestView)

export default RequestViewWithData