
const getCurrentTimeFormatted = () => {
  const currentTime = new Date()
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const milliseconds = currentTime.getMilliseconds()
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

type Reducer<State = any, Action = any> = (state: State, action: Action) => State

const logger = <R extends Reducer>(reducer: R): R => {
  const reducerWithLogger = (state: any, action: any) => {
    const next = reducer(state, action)
    console.group(
      `%caction: %c${action.type} %cat ${getCurrentTimeFormatted()}`,
      "color: lightgray; font-weight: 300;",
      "color: white; font-weight: bold;",
      "color: lightblue; font-weight: lighter;"
    )
    console.log("%cprev state:", "color: #9E9E9E; font-weight: 700;", state)
    console.log("%caction:", "color: #00A7F7; font-weight: 700;", action)
    console.log("%cnext state:", "color: #47B04B; font-weight: 700;", next)
    console.groupEnd()
    return next
  }

  return reducerWithLogger as R
}

export default logger
