"""
TESTS is a dict with all you tests.
Keys for this will be categories' names.
Each test is dict with
    "input" -- input data for user function
    "answer" -- your right answer
    "explanation" -- not necessary key, it's using for additional info in animation.
"""


TESTS = {
    "1. Basics": [
        {
            "input": [90, 0, 180]
        },
        {
            "input": [0, 0, 0]
        },
        {
            "input": [0, 90, 180]
        },
        {
            "input": [10, 20, 30]
        },
        {
            "input": [30, 60, 90]
        },

    ],
    "2. Extra": [
        {
            "input": [11, 22, 33]
        },
        {
            "input": [30, 60, 90]
        },
        {
            "input": [180, 90, 270]
        },
        {
            "input": [100, 200, 300]
        }


    ]
}

for cat in TESTS.keys():
    for t in TESTS[cat]:
        t["answer"] = t["input"]