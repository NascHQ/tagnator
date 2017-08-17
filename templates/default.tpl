<style type='text/css'>
    {{ styles }}
</style>
<div class='page'>
  {% for item in data %}
    <div
        class='tag {% if not (item.name) %}none{% endif %} {% if (opts.qr) %}qr{% endif %} {% if (opts.bar) %}bar{% endif %}'>
        {% if (item.name) %}
            {% if (item.id or opts.sequential) %}
                <div class='sequential'>{{ item.id }}</div>
            {% endif %}
            <div class='qr-name'>
                {% if (opts.qr) %}
                    <div class='qr'>
                        <img src='{{ item.qr }}' />
                    </div>
                {% endif %}
                <div class='name'>
                    {{ item.name }}
                </div>
            </div>
            {% if (opts.bar) %}
                <div class='bar'>
                    <img src='data:image/png;base64,{{ item.bar }}' />
                </div>
            {% endif %}
        {% endif %}
    </div>
    {% if (loop.index % 2 === 0) %}
    </div><div class='page'>
    {% endif %}
  {% endfor %}
</div>


<div class="controllers">
    <div class="hide" onclick='toggleController()'></div>
    <div class="options">
        <span>Width</span>
        <input name='width' type='range' value='9.2' title='9.2cm' min='8' max='12' step='.1' oninput="changedOptions(this)" data-kind='mm' />
        <br />

        <span>Height</span>
        <input name='height' type='range' value='6.1' title='6.1cm' min='4.8' max='11' step='.1' oninput="changedOptions(this)" data-kind='mm' />
        <br />

        <span>X-distance</span>
        <input name='margin-v' type='range' value='0.2' title='0.2cm' min='0' max='4' step='0.2' oninput="changedOptions(this)" />
        <br />

        <span>Y-distance</span>
        <input name='margin-h' type='range' value='0.2' title='0.2cm' min='0' max='4' step='0.2' oninput="changedOptions(this)" />
        <br />

        <span>Font-size</span>
        <input name='font-size' type='range' value='0.7' title='0.7cm' min='0.2' max='3' step='0.1' oninput="changedOptions(this)" />
        <br />

        <input name='contrast' type='checkbox' checked onchange="changedOptions(this)" />
        <span>Contrast</span>
        <br />

        <input name='border' type='checkbox' checked onchange="changedOptions(this)" />
        <span>Border</span>
        <br />
    </div>
</div>

<script>
    function setCSSVariable (variable, value) {
        console.log(variable, value)
        document.documentElement.style.setProperty(`--${variable}`, value);
    }
    function changedOptions (el) {
        let changed = el.getAttribute('name')
        let val
        let kind = 'rem'
        if (el.getAttribute('type') === 'checkbox') {
            val = el.checked
            if (changed === 'contrast') {
                kind = ''
                changed = 'contrast-bg'
                if (val) {
                    val = '#444'
                    setCSSVariable('contrast-fg', '#fff');
                } else {
                    val = '#fff'
                    setCSSVariable('contrast-fg', 'inherit');
                }
            } else {
                kind = 'px'
                if (val) {
                    val = 1
                } else {
                    val = 0
                }
            }
        } else {
            val = el.value
            el.setAttribute('title', val + 'cm')
        }
        setCSSVariable(changed, val + kind);
    }

    function toggleController () {
        let el = document.querySelector('.controllers')
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden')
        } else {
            el.classList.add('hidden')
        }
    }
</script>