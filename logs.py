from keras.callbacks import TensorBoard
import tensorflow as tf


class CustomTensorBoard(TensorBoard):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.writer = tf.summary.create_file_writer(self.log_dir)

    def set_model(self, model):
        pass

    def log(self, step, **stats):
        with self.writer.as_default():
            tf.summary.scalar("avg_score", stats["avg_score"], step=step)
            tf.summary.scalar("min_score", stats["min_score"], step=step)
            tf.summary.scalar("max_score", stats["max_score"], step=step)

        # self._write_logs(stats, step)
