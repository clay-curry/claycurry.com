'use client'

import React from 'react';
import { components } from './mdx';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote/rsc'

export default function BlogContentsClient({children}) {
  
  console.log(source)
  
  return (
    <div>
      <h1>Blog Contents Client</h1>
      <MDXRemote {...source} compiledSource={source.compiledSource} components={components} />
    </div>
  )
}
