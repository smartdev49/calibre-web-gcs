from setuptools import setup, find_packages 

# Read the requirements from the requirements.txt file
def read_requirements():
    with open('requirements.txt') as req_file:
        return req_file.read().splitlines()

setup(
    name='speechmatic',
    version='0.1',
    packages=find_packages(),
    install_requires=read_requirements(),
    # Add other necessary parameters like author, description, etc.
)
