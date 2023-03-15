from dqn_agent import DQNAgent
from tetris import Tetris
import tensorflow as tf

env = Tetris()

file_path = "saved_models/tetris"

model = tf.saved_model.load(file_path)

agent = DQNAgent(env.get_state_size(), model=model)

current_state = env.reset()
done = False

while True:
    try:
        next_states = env.get_next_states()
        best_state = agent.best_state(next_states.values())
        print(best_state)

        best_action = None
        for action, state in next_states.items():
            if state == best_state:
                best_action = action
                break

        reward, done = env.play(
            best_action[0], best_action[1], render=True, render_delay=0.1)
        current_state = next_states[best_action]
    except:
        current_state = env.reset()
