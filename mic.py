#!/usr/bin/env python
'''
mic.py - Markdown in Code
=========================
Create simple Markdown files for Github.

Any comments in /** ... */ are extracted to create README.md.

This is not meant to be used outside of this project (for now).

Usage:

    ./mic.py <source>
'''
import re
import os
import sys

def extract_c(source):
  regex = re.compile('/\*\*(.*)\*/', re.DOTALL | re.UNICODE | re.MULTILINE)
  docs = regex.search(source)
  if docs:
    return docs.groups()
  raise RuntimeError('No comments were found with /** ... */ styles.')

def cleanup(docs):
  return '\n'.join(m.lstrip(' *').strip() for doc in docs for m in doc.split('\n') )

if '__main__' in __name__:
  markdown = None
  with open(sys.argv[1]) as f:
    source = f.read()
    markdown = cleanup(extract_c(source))
  with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'README.md'), 'w') as target:
    target.write(str(markdown))

