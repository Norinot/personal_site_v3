export const snippets: Record<string, string> = {
  angular: `import { Component, OnInit } from '@angular/core';
// We need imports. Lots of imports.

@Component({
  selector: 'app-overkill',
  template: '<h1>Observable<Hello></h1>'
})
export class ComplexComponent implements OnInit {
  ngOnInit() {
    // Why use a variable when you can use a stream?
    this.data$.pipe(
      map(d => d.complex),
      tap(() => console.log('Side effects!')),
      catchError(e => of('Please subscribe'))
    ).subscribe();
  }
}`,
  react: `const Component = ({ prop1, prop2, prop3, ...rest }) => {
  // Is this state? Is it memoized? Who knows!
  const [reality, setReality] = useState(null);

  useEffect(() => {
     // I hope you cleaned up this effect
     // otherwise we're leaking memory forever
     return () => setReality(null);
  }, [JSON.stringify(rest)]); // The forbidden dependency

  return <div />;
};`,
  svelte: `<script>
  // Look mom, no hooks!
  let count = 0;
  
  // This is a reactive statement. 
  // It works by magic (and compiler parsing).
  $: doubled = count * 2; 
</script>

<button on:click={() => count++}>
  Clicked {count} times (Doubled: {doubled})
</button>`,
  java: `package com.enterprise.util;

// 50 lines of imports hidden here

public class SimpleStringFactoryImpl extends AbstractFactoryBean {
    public static void main(String[] args) {
        // Boilerplate is my love language
        System.out.println("Object Oriented Spaghetti");
    }
    
    // Getters and Setters for the rest of the file...
}`,
  go: `package main

import "fmt"

func main() {
    res, err := doSomething()
    if err != nil {
        panic(err) // The classic error check
    }
    
    res2, err := doSomethingElse()
    if err != nil {
        // Look familiar?
        return 
    }
    
    fmt.Println("I love typing these 3 lines.")
}`
};