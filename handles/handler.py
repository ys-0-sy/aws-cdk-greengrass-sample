import greengrasssdk

from io import StringIO
from io import BytesIO

import picamera
import time
import logging

import json
import base64

# Initialize logger
customer_logger = logging.getLogger(__name__)
# Create MQTT client
iot_client = greengrasssdk.client('iot-data')
topic_mes = "/part6/message"
topic_pic = "/part6/picture"


class Camera():
  # Capture Image
  def capture_image(self):
    camera = picamera.PiCamera()
    imageData = BytesIO()

    try:
      camera.resolution = (224, 224)
      camera.start_preview()
      time.sleep(2)
      camera.capture(imageData, format="jpeg", resize = (224, 224))
      camera.stop_prev
      imageData.seek(0)
      print("Image Captured")
      return imageData

    finally:
      camera.close()
      raise RuntimeError("There is problem to use your camera.")


def send_mqtt_message(mes):
  iot_client.publish(topic=topic_mes, payload=mes)


def send_mqtt_picture(imgdata):
  iot_client.publish(topic=topic_pic, payload=json.dumps({"data": imgdata}))


def take_pic():
  """
  take picture with picamera
  """
  send_mqtt_message("Taking a Photo")
  my_camera = Camera()
  send_mqtt_message("Taking a Photo 2")
  imagebinary = my_camera.capture_image()
  send_mqtt_message("Took a Photo")
  # DataEncode
  image64 = base64.b64encode(imagebinary.getvalue())
  #image_str = image64.decode("utf-8")
  return image64


# The lambda to be invoked in Greengrass
def handler(event, context):
  #try:
  img = take_pic()
  send_mqtt_picture(img)
  send_mqtt_message("Finish sending bin of picture")
#    except Exception as e:
#        customer_logger.exception(e)
#        send_mqtt_message(
#            'Exception occurred during prediction. Please check logs for troubleshooting: /greengrass/ggc/var/log.')
