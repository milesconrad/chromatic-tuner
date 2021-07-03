# chromatic-tuner
A chromatic tuner built in vanilla javascript using freelizer, which implements a noise gate and bootleg noise cancellation

Freelizer already came with the ability to identify notes, but to keep it challenging I removed all parts of freelizer that didn't identify the frequency of mic audio. I also added a few lines to determine volume levels which let me make the noise gate.

This is what the page will look like when you load it in your browser
![main-page](https://raw.githubusercontent.com/mmiiles/chromatic-tuner/main/images/mainpage.png)

After you allow microphone use and play a consistent note, the tuner will activate
![note-played](https://raw.githubusercontent.com/mmiiles/chromatic-tuner/main/images/noteplayed.png)

If the note is not consistent, meaning the frequency is fluctuating more than 1hz, the note will not be detected. If a consistent note is detected, then the note name will be displayed and the accuracy of the note will be displayed through the moving red line.