import os
from dotenv import load_dotenv

load_dotenv()

# Set variables
DEPLOY_PROJECT_ID = os.getenv('DEPLOY_PROJECT_ID')
DEPLOY_GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
DEPLOY_DOCKER_PATH = os.getenv('DEPLOY_DOCKER_PATH')
DEPLOY_SERVICE_NAME = os.getenv('DEPLOY_SERVICE_NAME')

print("Variables")
print(f"PROJECT_ID: {DEPLOY_PROJECT_ID}")
print(f"GOOGLE_APPLICATION_CREDENTIALS: {DEPLOY_GOOGLE_APPLICATION_CREDENTIALS}")
print(f"DEPLOY_DOCKER_PATH: {DEPLOY_DOCKER_PATH}")
print(f"SERVICE_NAME: {DEPLOY_SERVICE_NAME}")

if (DEPLOY_PROJECT_ID is None
    or DEPLOY_GOOGLE_APPLICATION_CREDENTIALS is None
    or DEPLOY_DOCKER_PATH is None
    or DEPLOY_SERVICE_NAME is None):
  print("Invalid configuration")
  exit

print("\nActivating service account ...")
os.system(f"gcloud auth activate-service-account --key-file=./{DEPLOY_GOOGLE_APPLICATION_CREDENTIALS}")
print("Service account was activated.")

print("\nSetting project id ...")
os.system(f"gcloud config set project {DEPLOY_PROJECT_ID}")
print("Project id has been set")

print("\nUploading ...")
os.system(f"gcloud builds submit  --config=cloudbuild.yaml --substitutions=_DOCKER_PATH={DEPLOY_DOCKER_PATH},_SERVICE_NAME={DEPLOY_SERVICE_NAME} .")
print("Done ...")

print(f"\nhttps://console.cloud.google.com/run?project={DEPLOY_PROJECT_ID}")
